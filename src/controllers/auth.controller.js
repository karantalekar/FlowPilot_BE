"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const auth_service_1 = require("../services/auth.service");
const async_handler_1 = require("../utils/async-handler");
const api_response_1 = require("../utils/api-response");
exports.authController = {
    register: (0, async_handler_1.asyncHandler)(async (req, res) => {
        const result = await auth_service_1.authService.register(req.body);
        (0, api_response_1.sendSuccess)(res, result, 'Registered successfully', http_status_1.default.CREATED);
    }),
    login: (0, async_handler_1.asyncHandler)(async (req, res) => {
        const result = await auth_service_1.authService.login(req.body.email, req.body.password);
        (0, api_response_1.sendSuccess)(res, result, 'Logged in successfully');
    }),
    me: (0, async_handler_1.asyncHandler)(async (req, res) => {
        (0, api_response_1.sendSuccess)(res, await auth_service_1.authService.me(req.auth.userId));
    }),
    updateMe: (0, async_handler_1.asyncHandler)(async (req, res) => {
        (0, api_response_1.sendSuccess)(res, await auth_service_1.authService.updateMe(req.auth.userId, req.body), 'Profile updated');
    }),
    changePassword: (0, async_handler_1.asyncHandler)(async (req, res) => {
        await auth_service_1.authService.changePassword(req.auth.userId, req.body.currentPassword, req.body.newPassword);
        (0, api_response_1.sendSuccess)(res, null, 'Password updated');
    }),
    google: (0, async_handler_1.asyncHandler)(async (req, res) => {
        const result = await auth_service_1.authService.googleLogin(req.body);
        (0, api_response_1.sendSuccess)(res, result, 'Google login successful');
    }),
    refreshToken: (0, async_handler_1.asyncHandler)(async (req, res) => {
        const result = await auth_service_1.authService.refresh(req.body.refreshToken);
        (0, api_response_1.sendSuccess)(res, result, 'Token refreshed');
    }),
    logout: (0, async_handler_1.asyncHandler)(async (req, res) => {
        await auth_service_1.authService.logout(req.auth.userId);
        (0, api_response_1.sendSuccess)(res, null, 'Logged out');
    }),
    forgotPassword: (0, async_handler_1.asyncHandler)(async (req, res) => {
        await auth_service_1.authService.forgotPassword(req.body.email);
        (0, api_response_1.sendSuccess)(res, null, 'Password reset email sent if the account exists');
    }),
    resetPassword: (0, async_handler_1.asyncHandler)(async (req, res) => {
        await auth_service_1.authService.resetPassword(req.body.token, req.body.password);
        (0, api_response_1.sendSuccess)(res, null, 'Password reset successful');
    })
    ,acceptInvite: (0, async_handler_1.asyncHandler)(async (req, res) => {
        const result = await auth_service_1.authService.acceptInvite(req.body.token, req.body.password);
        (0, api_response_1.sendSuccess)(res, result, 'Invitation accepted');
    })
};
