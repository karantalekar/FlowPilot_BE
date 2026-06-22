"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.billingService = exports.usageLimits = void 0;
const crypto_1 = __importDefault(require("crypto"));
const http_status_1 = __importDefault(require("http-status"));
const env_1 = require("../config/env");
const billing_model_1 = require("../models/billing.model");
const organization_model_1 = require("../models/organization.model");
const api_error_1 = require("../utils/api-error");
const subscription_middleware_1 = require("../middlewares/subscription.middleware");

const planIdMap = {
    pro: env_1.env.RAZORPAY_PLAN_PRO,
    business: env_1.env.RAZORPAY_PLAN_BUSINESS
};
const isConfigured = () => Boolean(env_1.env.RAZORPAY_KEY_ID && env_1.env.RAZORPAY_KEY_SECRET);
const razorpayRequest = async (path, options = {}) => {
    if (!isConfigured())
        throw new api_error_1.ApiError(http_status_1.default.SERVICE_UNAVAILABLE, 'Razorpay is not configured');
    const response = await fetch(`https://api.razorpay.com/v1${path}`, {
        ...options,
        headers: {
            Authorization: `Basic ${Buffer.from(`${env_1.env.RAZORPAY_KEY_ID}:${env_1.env.RAZORPAY_KEY_SECRET}`).toString('base64')}`,
            'Content-Type': 'application/json',
            ...options.headers
        },
        signal: AbortSignal.timeout(30000)
    });
    const data = await response.json();
    if (!response.ok)
        throw new api_error_1.ApiError(response.status, data?.error?.description || 'Razorpay request failed');
    return data;
};
const secureEqual = (actual, expected) => {
    const actualBuffer = Buffer.from(actual || '', 'utf8');
    const expectedBuffer = Buffer.from(expected || '', 'utf8');
    return actualBuffer.length === expectedBuffer.length && crypto_1.default.timingSafeEqual(actualBuffer, expectedBuffer);
};
const checkoutSignature = (paymentId, subscriptionId) => crypto_1.default
    .createHmac('sha256', env_1.env.RAZORPAY_KEY_SECRET || '')
    .update(`${paymentId}|${subscriptionId}`)
    .digest('hex');

exports.usageLimits = {
    free: { users: 5, aiMessages: 100, documents: 20 },
    pro: { users: 25, aiMessages: 2000, documents: 500 },
    business: { users: 250, aiMessages: 20000, documents: 5000 }
};
exports.billingService = {
    async createSubscription(organizationId, plan) {
        const org = await organization_model_1.Organization.findById(organizationId);
        if (!org)
            throw new api_error_1.ApiError(http_status_1.default.NOT_FOUND, 'Organization not found');
        const planId = planIdMap[plan];
        if (!planId)
            throw new api_error_1.ApiError(http_status_1.default.BAD_REQUEST, 'Razorpay plan is not configured for this tier');
        const subscription = await razorpayRequest('/subscriptions', {
            method: 'POST',
            body: JSON.stringify({
                plan_id: planId,
                total_count: 12,
                quantity: 1,
                customer_notify: 1,
                notes: { organizationId: organizationId.toString(), plan }
            })
        });
        await organization_model_1.Organization.findByIdAndUpdate(organizationId, {
            razorpaySubscriptionId: subscription.id,
            subscriptionStatus: 'incomplete'
        });
        return {
            keyId: env_1.env.RAZORPAY_KEY_ID,
            subscriptionId: subscription.id,
            name: env_1.env.APP_NAME,
            description: `${plan[0].toUpperCase()}${plan.slice(1)} plan subscription`
        };
    },
    async verifyPayment(organizationId, input) {
        const org = await organization_model_1.Organization.findOne({
            _id: organizationId,
            razorpaySubscriptionId: input.razorpay_subscription_id
        });
        if (!org)
            throw new api_error_1.ApiError(http_status_1.default.BAD_REQUEST, 'Subscription does not belong to this workspace');
        const expected = checkoutSignature(input.razorpay_payment_id, org.razorpaySubscriptionId);
        if (!secureEqual(input.razorpay_signature, expected))
            throw new api_error_1.ApiError(http_status_1.default.BAD_REQUEST, 'Invalid Razorpay payment signature');
        const subscription = await razorpayRequest(`/subscriptions/${org.razorpaySubscriptionId}`);
        const plan = subscription.notes?.plan;
        if (!['pro', 'business'].includes(plan))
            throw new api_error_1.ApiError(http_status_1.default.BAD_REQUEST, 'Subscription plan metadata is invalid');
        const payment = await razorpayRequest(`/payments/${input.razorpay_payment_id}`);
        await Promise.all([
            organization_model_1.Organization.findByIdAndUpdate(organizationId, {
                plan,
                subscriptionStatus: 'active'
            }),
            billing_model_1.PaymentHistory.updateOne({ razorpayPaymentId: payment.id }, {
                $setOnInsert: {
                    organization: organizationId,
                    razorpayPaymentId: payment.id,
                    razorpaySubscriptionId: org.razorpaySubscriptionId,
                    amount: payment.amount,
                    currency: payment.currency,
                    status: payment.status === 'captured' ? 'paid' : payment.status,
                    paidAt: new Date((payment.created_at || Math.floor(Date.now() / 1000)) * 1000)
                }
            }, { upsert: true })
        ]);
        return { verified: true, plan };
    },
    async handleWebhook(rawBody, signature) {
        if (!env_1.env.RAZORPAY_WEBHOOK_SECRET)
            throw new api_error_1.ApiError(http_status_1.default.SERVICE_UNAVAILABLE, 'Razorpay webhook is not configured');
        const expected = crypto_1.default.createHmac('sha256', env_1.env.RAZORPAY_WEBHOOK_SECRET).update(rawBody).digest('hex');
        if (!secureEqual(signature, expected))
            throw new api_error_1.ApiError(http_status_1.default.BAD_REQUEST, 'Invalid Razorpay webhook signature');
        const event = JSON.parse(rawBody.toString('utf8'));
        const subscription = event.payload?.subscription?.entity;
        const payment = event.payload?.payment?.entity;
        const subscriptionId = subscription?.id || payment?.subscription_id;
        const org = subscriptionId
            ? await organization_model_1.Organization.findOne({ razorpaySubscriptionId: subscriptionId })
            : null;
        if (org && subscription) {
            const statuses = { active: 'active', authenticated: 'active', pending: 'past_due', halted: 'past_due', cancelled: 'canceled', completed: 'canceled', expired: 'canceled' };
            const nextStatus = statuses[subscription.status];
            if (nextStatus)
                await organization_model_1.Organization.findByIdAndUpdate(org._id, { subscriptionStatus: nextStatus });
        }
        if (org && payment && (event.event === 'payment.captured' || payment.status === 'captured')) {
            await billing_model_1.PaymentHistory.updateOne({ razorpayPaymentId: payment.id }, {
                $setOnInsert: {
                    organization: org._id,
                    razorpayPaymentId: payment.id,
                    razorpaySubscriptionId: subscriptionId,
                    amount: payment.amount,
                    currency: payment.currency,
                    status: 'paid',
                    paidAt: new Date((payment.created_at || Math.floor(Date.now() / 1000)) * 1000)
                }
            }, { upsert: true });
        }
        return { received: true };
    },
    async subscription(organizationId) {
        const organization = await organization_model_1.Organization.findById(organizationId).select('plan subscriptionStatus razorpaySubscriptionId usage trialEndsAt createdAt');
        if (!organization)
            throw new api_error_1.ApiError(http_status_1.default.NOT_FOUND, 'Organization not found');
        return { ...organization.toObject(), ...(0, subscription_middleware_1.getTrialStatus)(organization) };
    },
    paymentHistory(organizationId) {
        return billing_model_1.PaymentHistory.find({ organization: organizationId }).sort('-createdAt');
    }
};
