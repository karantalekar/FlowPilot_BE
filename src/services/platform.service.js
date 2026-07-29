"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.platformService = void 0;
const { env } = require("../config/env");
const { PlatformAdmin } = require("../models/platform-admin.model");
const { Plan, Subscription, PlatformPayment, Invoice, PlatformActivity, PlatformSetting } = require("../models/platform.model");
const { Organization } = require("../models/organization.model");
const { User } = require("../models/user.model");
const { ApiError } = require("../utils/api-error");
const { hashToken, signPlatformAccessToken, signPlatformRefreshToken, verifyPlatformRefreshToken } = require("../utils/tokens");
const { getPagination } = require("../utils/pagination");

const safeAdmin = admin => ({ id: admin.id, name: admin.name, email: admin.email, role: admin.role, lastLoginAt: admin.lastLoginAt });
const authPayload = admin => ({ adminId: admin.id, role: admin.role, sessionVersion: admin.sessionVersion || 0 });
const issueTokens = async admin => {
    const payload = authPayload(admin);
    const accessToken = signPlatformAccessToken(payload);
    const refreshToken = signPlatformRefreshToken(payload);
    admin.refreshTokenHash = hashToken(refreshToken);
    await admin.save();
    return { admin: safeAdmin(admin), accessToken, refreshToken };
};
const audit = (adminId, action, entity, entityId, context = {}, metadata = {}) =>
    PlatformActivity.create({ actor: adminId, action, entity, entityId, ip: context.ip, userAgent: context.userAgent, requestId: context.requestId, metadata });
const filterFrom = (query, fields) => {
    const filter = {};
    if (query.status) filter.status = query.status;
    if (query.search && fields.length) filter.$or = fields.map(field => ({ [field]: { $regex: query.search, $options: 'i' } }));
    return filter;
};
const list = async (model, query, filter = {}, populate = '') => {
    const { page, limit, skip } = getPagination(query);
    const [items, total] = await Promise.all([
        model.find(filter).populate(populate).sort(query.sort || '-createdAt').skip(skip).limit(limit).lean(),
        model.countDocuments(filter)
    ]);
    return { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

exports.platformService = {
    async bootstrap() {
        if (!env.PLATFORM_ADMIN_EMAIL || !env.PLATFORM_ADMIN_PASSWORD) return;
        const exists = await PlatformAdmin.exists({ email: env.PLATFORM_ADMIN_EMAIL.toLowerCase() });
        if (!exists) await PlatformAdmin.create({ name: env.PLATFORM_ADMIN_NAME, email: env.PLATFORM_ADMIN_EMAIL, password: env.PLATFORM_ADMIN_PASSWORD });
    },
    async register(input, setupKey, context) {
        if (!env.PLATFORM_SETUP_KEY) throw new ApiError(404, 'Platform registration is disabled');
        const supplied = Buffer.from(setupKey || '');
        const expected = Buffer.from(env.PLATFORM_SETUP_KEY);
        const validKey = supplied.length === expected.length && require('crypto').timingSafeEqual(supplied, expected);
        if (!validKey) throw new ApiError(403, 'Invalid platform setup key');
        if (await PlatformAdmin.exists({})) throw new ApiError(409, 'Platform owner already registered');
        const admin = await PlatformAdmin.create({ name: input.name, email: input.email, password: input.password });
        const session = await issueTokens(await PlatformAdmin.findById(admin.id).select('+sessionVersion +refreshTokenHash'));
        await audit(admin.id, 'PLATFORM_ADMIN_REGISTERED', 'PlatformAdmin', admin._id, context);
        return session;
    },
    async login(email, password, context) {
        const admin = await PlatformAdmin.findOne({ email }).select('+password +refreshTokenHash +sessionVersion +failedLoginAttempts +lockedUntil');
        if (!admin || admin.status !== 'active' || (admin.lockedUntil && admin.lockedUntil > new Date()) || !(await admin.comparePassword(password))) {
            if (admin) {
                admin.failedLoginAttempts = (admin.failedLoginAttempts || 0) + 1;
                if (admin.failedLoginAttempts >= 5) admin.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
                await admin.save();
            }
            throw new ApiError(401, 'Invalid credentials');
        }
        admin.failedLoginAttempts = 0; admin.lockedUntil = undefined; admin.lastLoginAt = new Date(); admin.lastLoginIp = context.ip;
        const session = await issueTokens(admin);
        await audit(admin.id, 'LOGIN', 'PlatformAdmin', admin._id, context);
        return session;
    },
    async refresh(token) {
        const payload = verifyPlatformRefreshToken(token);
        if (payload.tokenType !== 'platform_refresh') throw new ApiError(401, 'Invalid platform refresh token');
        const admin = await PlatformAdmin.findById(payload.adminId).select('+refreshTokenHash +sessionVersion');
        if (!admin || admin.status !== 'active' || admin.sessionVersion !== payload.sessionVersion || admin.refreshTokenHash !== hashToken(token)) throw new ApiError(401, 'Invalid platform refresh token');
        return issueTokens(admin);
    },
    async logout(admin, context) {
        admin.refreshTokenHash = undefined; admin.sessionVersion = (admin.sessionVersion || 0) + 1; await admin.save();
        await audit(admin.id, 'LOGOUT', 'PlatformAdmin', admin._id, context);
    },
    safeAdmin,
    audit,
    async overview() {
        const now = new Date(); const yearStart = new Date(now.getFullYear(), 0, 1); const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const [totalOrganizations, activeOrganizations, suspendedOrganizations, roleCounts, activeSubscriptions, expiredSubscriptions, paymentCounts, monthlyRevenue, yearlyRevenue] = await Promise.all([
            Organization.countDocuments({ platformStatus: { $ne: 'deleted' } }), Organization.countDocuments({ platformStatus: 'active' }), Organization.countDocuments({ platformStatus: 'suspended' }),
            User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
            Subscription.countDocuments({ status: 'active', expiresAt: { $gt: now } }), Subscription.countDocuments({ $or: [{ status: 'expired' }, { expiresAt: { $lte: now } }] }),
            PlatformPayment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
            PlatformPayment.aggregate([{ $match: { status: 'verified', verifiedAt: { $gte: monthStart } } }, { $group: { _id: null, value: { $sum: '$amount' } } }]),
            PlatformPayment.aggregate([{ $match: { status: 'verified', verifiedAt: { $gte: yearStart } } }, { $group: { _id: null, value: { $sum: '$amount' } } }])
        ]);
        const roles = Object.fromEntries(roleCounts.map(x => [x._id, x.count])); const payments = Object.fromEntries(paymentCounts.map(x => [x._id, x.count]));
        return { totalOrganizations, activeOrganizations, suspendedOrganizations, totalUsers: Object.values(roles).reduce((a, b) => a + b, 0), totalAdmins: roles.admin || 0, totalManagers: roles.manager || 0, totalEmployees: roles.employee || 0, activeSubscriptions, expiredSubscriptions, pendingPayments: payments.pending || 0, verifiedPayments: payments.verified || 0, rejectedPayments: payments.rejected || 0, monthlyRevenue: monthlyRevenue[0]?.value || 0, yearlyRevenue: yearlyRevenue[0]?.value || 0 };
    },
    organizations: q => list(Organization, q, {
        ...(q.search ? { $or: ['name', 'slug'].map(field => ({ [field]: { $regex: q.search, $options: 'i' } })) } : {}),
        platformStatus: q.status || { $ne: 'deleted' }
    }, 'owner'),
    organization: async id => {
        const organization = await Organization.findById(id).populate('owner').lean();
        if (!organization) throw new ApiError(404, 'Organization not found');
        const [users, subscription, payments, invoices] = await Promise.all([User.find({ organization: id }).select('-password').lean(), Subscription.findOne({ organization: id }).populate('plan').lean(), PlatformPayment.find({ organization: id }).sort('-createdAt').lean(), Invoice.find({ organization: id }).sort('-createdAt').lean()]);
        return { organization, users, subscription, payments, invoices };
    },
    async setOrganizationStatus(id, input, admin, context) {
        const update = input.status === 'suspended' ? { platformStatus: 'suspended', suspendedAt: new Date(), suspensionReason: input.reason } : { platformStatus: 'active', $unset: { suspendedAt: 1, suspensionReason: 1 } };
        const org = await Organization.findByIdAndUpdate(id, update, { new: true });
        if (!org) throw new ApiError(404, 'Organization not found');
        await audit(admin.id, input.status === 'suspended' ? 'ORGANIZATION_SUSPENDED' : 'ORGANIZATION_ACTIVATED', 'Organization', org._id, context, { reason: input.reason });
        return org;
    },
    async deleteOrganization(id, admin, context) {
        const org = await Organization.findByIdAndUpdate(id, { platformStatus: 'deleted', deletedAt: new Date() }, { new: true });
        if (!org) throw new ApiError(404, 'Organization not found');
        await audit(admin.id, 'ORGANIZATION_DELETED', 'Organization', org._id, context);
    },
    users: q => list(User, q, { ...filterFrom(q, ['name', 'email']) }, 'organization'),
    plans: q => list(Plan, q, filterFrom(q, ['name', 'code'])),
    async createPlan(input, admin, context) { const item = await Plan.create({ ...input, createdBy: admin.id }); await audit(admin.id, 'PLAN_CREATED', 'Plan', item._id, context); return item; },
    async updatePlan(id, input, admin, context) { const item = await Plan.findByIdAndUpdate(id, input, { new: true, runValidators: true }); if (!item) throw new ApiError(404, 'Plan not found'); await audit(admin.id, 'PLAN_MODIFIED', 'Plan', item._id, context, { fields: Object.keys(input) }); return item; },
    async deletePlan(id, admin, context) { if (await Subscription.exists({ plan: id, status: { $in: ['active', 'trialing'] } })) throw new ApiError(409, 'Plan has active subscriptions'); const item = await Plan.findByIdAndDelete(id); if (!item) throw new ApiError(404, 'Plan not found'); await audit(admin.id, 'PLAN_DELETED', 'Plan', item._id, context); },
    subscriptions: q => list(Subscription, q, filterFrom(q, []), 'organization plan'),
    async subscriptionAction(id, input, admin, context) {
        const item = await Subscription.findById(id); if (!item) throw new ApiError(404, 'Subscription not found');
        const previousExpiry = item.expiresAt;
        if (input.action === 'renew' || input.action === 'extend') { const days = input.days || (item.billingCycle === 'yearly' ? 365 : 30); const from = item.expiresAt > new Date() ? item.expiresAt : new Date(); item.expiresAt = new Date(from.getTime() + days * 86400000); item.status = 'active'; item.renewalHistory.push({ renewedAt: new Date(), previousExpiry, newExpiry: item.expiresAt, actor: admin.id }); }
        if (input.action === 'suspend') item.status = 'suspended'; if (input.action === 'cancel') item.status = 'canceled';
        if (input.action === 'change_plan') { if (!input.planId) throw new ApiError(400, 'planId is required'); item.plan = input.planId; if (input.billingCycle) item.billingCycle = input.billingCycle; }
        await item.save(); await audit(admin.id, `SUBSCRIPTION_${input.action.toUpperCase()}`, 'Subscription', item._id, context); return item.populate('organization plan');
    },
    payments: q => list(PlatformPayment, q, filterFrom(q, ['transactionId']), 'organization subscription payer'),
    async decidePayment(id, input, admin, context) {
        const item = await PlatformPayment.findById(id);
        if (!item) throw new ApiError(404, 'Payment not found');
        if (item.status !== 'pending') throw new ApiError(409, 'Payment has already been reviewed');
        item.status = input.decision; item.verifiedBy = admin.id; item.verifiedAt = new Date(); item.rejectionReason = input.reason;
        await item.save();
        if (input.decision === 'verified' && item.plan) {
            await Organization.findByIdAndUpdate(item.organization, { plan: item.plan, subscriptionStatus: 'active' });
        }
        await audit(admin.id, input.decision === 'verified' ? 'PAYMENT_VERIFIED' : 'PAYMENT_REJECTED', 'PlatformPayment', item._id, context, { reason: input.reason, transactionId: item.transactionId, payer: item.payer, plan: item.plan });
        return item.populate('organization payer');
    },
    invoices: q => list(Invoice, q, filterFrom(q, ['number']), 'organization subscription'),
    async invoiceStatus(id, status, admin, context) { const item = await Invoice.findByIdAndUpdate(id, { status, ...(status === 'paid' ? { paidAt: new Date() } : {}) }, { new: true }); if (!item) throw new ApiError(404, 'Invoice not found'); await audit(admin.id, `INVOICE_${status.toUpperCase()}`, 'Invoice', item._id, context); return item; },
    activities: q => list(PlatformActivity, q, filterFrom(q, ['action', 'entity']), 'actor'),
    async reports() {
        return PlatformPayment.aggregate([{ $match: { status: 'verified' } }, { $group: { _id: { year: { $year: '$verifiedAt' }, month: { $month: '$verifiedAt' } }, revenue: { $sum: '$amount' }, payments: { $sum: 1 } } }, { $sort: { '_id.year': 1, '_id.month': 1 } }]);
    },
    settings: () => PlatformSetting.find().lean(),
    async setSetting(input, admin, context) { const item = await PlatformSetting.findOneAndUpdate({ key: input.key }, { value: input.value, updatedBy: admin.id }, { upsert: true, new: true }); await audit(admin.id, 'SETTINGS_UPDATED', 'PlatformSetting', item._id, context, { key: input.key }); return item; }
};
