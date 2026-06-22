"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const organization_model_1 = require("../models/organization.model");
const user_model_1 = require("../models/user.model");
const api_error_1 = require("../utils/api-error");
const tokens_1 = require("../utils/tokens");
const email_service_1 = require("./email.service");
const slugify = (value) => value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
const ensureWorkspace = async (user) => {
    if (user.organization)
        return;
    const organizationName = `${user.name}'s Workspace`;
    const organization = await organization_model_1.Organization.create({
        name: organizationName,
        slug: `${slugify(organizationName)}-${user._id.toString().slice(-6)}`,
        owner: user._id
    });
    user.organization = organization._id;
    if (user.role === 'employee')
        user.role = 'admin';
    await user.save();
};
const buildAuthPayload = (user) => ({
    userId: user._id.toString(),
    organizationId: user.organization?.toString(),
    role: user.role
});
const issueTokens = async (user) => {
    const payload = buildAuthPayload(user);
    const accessToken = (0, tokens_1.signAccessToken)(payload);
    const refreshToken = (0, tokens_1.signRefreshToken)(payload);
    user.refreshTokenHash = (0, tokens_1.hashToken)(refreshToken);
    user.lastLoginAt = new Date();
    await user.save();
    return { accessToken, refreshToken };
};
exports.authService = {
    async me(userId) {
        const user = await user_model_1.User.findById(userId);
        if (!user)
            throw new api_error_1.ApiError(http_status_1.default.NOT_FOUND, 'User not found');
        return user;
    },
    async updateMe(userId, input) {
        const update = {};
        if (typeof input.name === 'string' && input.name.trim().length >= 2)
            update.name = input.name.trim();
        const user = await user_model_1.User.findByIdAndUpdate(userId, update, { new: true });
        if (!user)
            throw new api_error_1.ApiError(http_status_1.default.NOT_FOUND, 'User not found');
        return user;
    },
    async changePassword(userId, currentPassword, newPassword) {
        if (!currentPassword || !newPassword || newPassword.length < 8)
            throw new api_error_1.ApiError(http_status_1.default.BAD_REQUEST, 'Current password and a new password of at least 8 characters are required');
        const user = await user_model_1.User.findById(userId).select('+password');
        if (!user || !user.password || !(await user.comparePassword(currentPassword)))
            throw new api_error_1.ApiError(http_status_1.default.UNAUTHORIZED, 'Current password is incorrect');
        user.password = newPassword;
        await user.save();
    },
    async register(input) {
        const existing = await user_model_1.User.findOne({ email: input.email });
        if (existing)
            throw new api_error_1.ApiError(http_status_1.default.CONFLICT, 'Email already registered');
        const user = await user_model_1.User.create({
            name: input.name,
            email: input.email,
            password: input.password,
            role: 'admin',
            provider: 'local',
            emailVerificationToken: (0, tokens_1.randomToken)()
        });
        const organizationName = input.organizationName || `${input.name}'s Workspace`;
        const org = await organization_model_1.Organization.create({
            name: organizationName,
            slug: `${slugify(organizationName)}-${user._id.toString().slice(-6)}`,
            owner: user._id
        });
        user.organization = org._id;
        await user.save();
        await email_service_1.emailService.sendVerificationEmail(user.email, user.emailVerificationToken);
        const tokens = await issueTokens(user);
        return { user, organization: org, ...tokens };
    },
    async login(email, password) {
        const user = await user_model_1.User.findOne({ email }).select('+password +refreshTokenHash');
        if (!user || !user.password || !(await user.comparePassword(password))) {
            throw new api_error_1.ApiError(http_status_1.default.UNAUTHORIZED, 'Invalid credentials');
        }
        await ensureWorkspace(user);
        const tokens = await issueTokens(user);
        return { user, ...tokens };
    },
    async googleLogin(input) {
        let user = await user_model_1.User.findOne({ email: input.email });
        if (!user) {
            user = await user_model_1.User.create({
                email: input.email,
                name: input.name,
                provider: 'google',
                isEmailVerified: true,
                role: 'employee'
            });
        }
        await ensureWorkspace(user);
        const tokens = await issueTokens(user);
        return { user, ...tokens };
    },
    async refresh(refreshToken) {
        const payload = (0, tokens_1.verifyRefreshToken)(refreshToken);
        const user = await user_model_1.User.findById(payload.userId).select('+refreshTokenHash');
        if (!user || user.refreshTokenHash !== (0, tokens_1.hashToken)(refreshToken)) {
            throw new api_error_1.ApiError(http_status_1.default.UNAUTHORIZED, 'Invalid refresh token');
        }
        return issueTokens(user);
    },
    async logout(userId) {
        await user_model_1.User.findByIdAndUpdate(userId, { $unset: { refreshTokenHash: 1 } });
    },
    async forgotPassword(email) {
        const user = await user_model_1.User.findOne({ email }).select('+passwordResetToken +passwordResetExpires');
        if (!user)
            return;
        const token = (0, tokens_1.randomToken)();
        user.passwordResetToken = (0, tokens_1.hashToken)(token);
        user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);
        await user.save();
        await email_service_1.emailService.sendPasswordResetEmail(email, token);
    },
    async resetPassword(token, password) {
        const user = await user_model_1.User.findOne({
            passwordResetToken: (0, tokens_1.hashToken)(token),
            passwordResetExpires: { $gt: new Date() }
        }).select('+passwordResetToken +passwordResetExpires +password');
        if (!user)
            throw new api_error_1.ApiError(http_status_1.default.BAD_REQUEST, 'Invalid or expired reset token');
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
    },
    async acceptInvite(token, password) {
        const user = await user_model_1.User.findOne({
            passwordResetToken: (0, tokens_1.hashToken)(token),
            passwordResetExpires: { $gt: new Date() }
        }).select('+passwordResetToken +passwordResetExpires +password');
        if (!user)
            throw new api_error_1.ApiError(http_status_1.default.BAD_REQUEST, 'Invalid or expired invitation');
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        const tokens = await issueTokens(user);
        return { user, ...tokens };
    }
};
