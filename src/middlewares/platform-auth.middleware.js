"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePlatformSuperAdmin = void 0;
const { ApiError } = require("../utils/api-error");
const { asyncHandler } = require("../utils/async-handler");
const { verifyPlatformAccessToken } = require("../utils/tokens");
const { PlatformAdmin } = require("../models/platform-admin.model");

exports.requirePlatformSuperAdmin = asyncHandler(async (req, _res, next) => {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new ApiError(401, 'Platform authentication required');
    const payload = verifyPlatformAccessToken(token);
    if (payload.tokenType !== 'platform_access' || payload.role !== 'platform_super_admin') {
        throw new ApiError(403, 'Platform access denied');
    }
    const admin = await PlatformAdmin.findById(payload.adminId).select('+sessionVersion');
    if (!admin || admin.status !== 'active' || admin.sessionVersion !== payload.sessionVersion) {
        throw new ApiError(401, 'Platform session is no longer valid');
    }
    req.platformAuth = { adminId: admin.id, role: admin.role };
    req.platformAdmin = admin;
    next();
});
