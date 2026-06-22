"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const api_error_1 = require("../utils/api-error");
const async_handler_1 = require("../utils/async-handler");
const tokens_1 = require("../utils/tokens");
const user_model_1 = require("../models/user.model");
const authenticate = (0, async_handler_1.asyncHandler)(async (req, _res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    if (!token)
        throw new api_error_1.ApiError(401, 'Authentication required');
    const payload = (0, tokens_1.verifyAccessToken)(token);
    const user = await user_model_1.User.findById(payload.userId).select('role organization');
    if (!user)
        throw new api_error_1.ApiError(401, 'Account no longer exists');
    req.auth = { ...payload, role: user.role, organizationId: user.organization?.toString() };
    req.tenantId = user.organization?.toString();
    next();
});
exports.authenticate = authenticate;
