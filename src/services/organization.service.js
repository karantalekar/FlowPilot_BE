"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) { return (mod && mod.__esModule) ? mod : { "default": mod }; };
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const organization_model_1 = require("../models/organization.model");
const user_model_1 = require("../models/user.model");
const api_error_1 = require("../utils/api-error");
const tokens_1 = require("../utils/tokens");
const email_service_1 = require("./email.service");
const email_template_service_1 = require("./email-template.service");
const env_1 = require("../config/env");
const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const sendInviteEmail = (to, subject, html, attachments = []) => Promise.race([
    email_service_1.emailService.send(to, subject, html, attachments),
    new Promise((resolve) => setTimeout(() => resolve(false), env_1.env.SMTP_TIMEOUT_MS))
]);
exports.organizationService = {
    members(organizationId) {
        return user_model_1.User.find({ organization: organizationId }).sort('name');
    },
    async inviteMember(organizationId, inviterRole, input) {
        if (inviterRole === 'manager' && input.role !== 'employee')
            throw new api_error_1.ApiError(http_status_1.default.FORBIDDEN, 'Managers can invite Employees only');
        const organization = await organization_model_1.Organization.findById(organizationId).select('name');
        if (!organization)
            throw new api_error_1.ApiError(http_status_1.default.NOT_FOUND, 'Organization not found');
        const existing = await user_model_1.User.findOne({ email: input.email });
        if (existing)
            throw new api_error_1.ApiError(http_status_1.default.CONFLICT, 'Email already belongs to an account');
        const inviteToken = (0, tokens_1.randomToken)();
        const user = await user_model_1.User.create({ name: input.name, email: input.email, role: input.role, organization: organizationId, provider: 'local', passwordResetToken: (0, tokens_1.hashToken)(inviteToken), passwordResetExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
        const inviteUrl = `${env_1.env.CLIENT_URL}/auth/accept-invite?token=${inviteToken}`;
        const invitationEmail = (0, email_template_service_1.buildInvitationEmail)({ appName: env_1.env.APP_NAME, clientUrl: env_1.env.CLIENT_URL, recipientName: input.name, role: input.role, workspaceName: organization.name, inviteUrl });
        const emailSent = await sendInviteEmail(input.email, invitationEmail.subject, invitationEmail.html, invitationEmail.attachments);
        return { user, emailSent, inviteUrl };
    },
    async updateMember(organizationId, memberId, data) {
        const org = await organization_model_1.Organization.findById(organizationId);
        if (!org)
            throw new api_error_1.ApiError(http_status_1.default.NOT_FOUND, 'Organization not found');
        if (org.owner.toString() === memberId && data.role && data.role !== 'admin')
            throw new api_error_1.ApiError(http_status_1.default.FORBIDDEN, 'The workspace owner must remain an admin');
        if (data.email) {
            const duplicate = await user_model_1.User.exists({ email: data.email.toLowerCase(), _id: { $ne: memberId } });
            if (duplicate)
                throw new api_error_1.ApiError(http_status_1.default.CONFLICT, 'Email already belongs to an account');
        }
        const update = {
            ...(data.name ? { name: data.name.trim() } : {}),
            ...(data.email ? { email: data.email.trim().toLowerCase() } : {}),
            ...(data.role ? { role: data.role } : {})
        };
        const member = await user_model_1.User.findOneAndUpdate({ _id: memberId, organization: organizationId }, update, { new: true, runValidators: true });
        if (!member)
            throw new api_error_1.ApiError(http_status_1.default.NOT_FOUND, 'Team member not found');
        return member;
    },
    async removeMember(organizationId, requesterId, memberId) {
        if (requesterId === memberId)
            throw new api_error_1.ApiError(http_status_1.default.BAD_REQUEST, 'You cannot remove your own account');
        const org = await organization_model_1.Organization.findById(organizationId);
        if (!org)
            throw new api_error_1.ApiError(http_status_1.default.NOT_FOUND, 'Organization not found');
        if (org.owner.toString() === memberId)
            throw new api_error_1.ApiError(http_status_1.default.FORBIDDEN, 'The workspace owner cannot be removed');
        const member = await user_model_1.User.findOneAndDelete({ _id: memberId, organization: organizationId });
        if (!member)
            throw new api_error_1.ApiError(http_status_1.default.NOT_FOUND, 'Team member not found');
    },
    async create(userId, name) {
        const org = await organization_model_1.Organization.create({ name, slug: `${slugify(name)}-${userId.slice(-6)}`, owner: userId });
        await user_model_1.User.findByIdAndUpdate(userId, { organization: org._id, role: 'admin' });
        return org;
    },
    async current(organizationId) {
        const org = await organization_model_1.Organization.findById(organizationId);
        if (!org)
            throw new api_error_1.ApiError(http_status_1.default.NOT_FOUND, 'Organization not found');
        return org;
    },
    async update(id, organizationId, data) {
        if (id !== organizationId)
            throw new api_error_1.ApiError(http_status_1.default.FORBIDDEN, 'Cannot edit another organization');
        const update = data.name ? { name: data.name, slug: `${slugify(data.name)}-${id.slice(-6)}` } : {};
        const org = await organization_model_1.Organization.findByIdAndUpdate(id, update, { new: true });
        if (!org)
            throw new api_error_1.ApiError(http_status_1.default.NOT_FOUND, 'Organization not found');
        return org;
    }
};
