"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireMinRole = exports.requireRoles = void 0;
const http_status_1 = __importDefault(require("http-status"));
const api_error_1 = require("../utils/api-error");
const rank = {
    employee: 1,
    manager: 2,
    admin: 3,
    super_admin: 4
};
const requireRoles = (...roles) => (req, _res, next) => {
    if (!req.auth)
        throw new api_error_1.ApiError(http_status_1.default.UNAUTHORIZED, 'Authentication required');
    if (!roles.includes(req.auth.role))
        throw new api_error_1.ApiError(http_status_1.default.FORBIDDEN, 'Insufficient permissions');
    next();
};
exports.requireRoles = requireRoles;
const requireMinRole = (role) => (req, _res, next) => {
    if (!req.auth)
        throw new api_error_1.ApiError(http_status_1.default.UNAUTHORIZED, 'Authentication required');
    if (rank[req.auth.role] < rank[role])
        throw new api_error_1.ApiError(http_status_1.default.FORBIDDEN, 'Insufficient permissions');
    next();
};
exports.requireMinRole = requireMinRole;
