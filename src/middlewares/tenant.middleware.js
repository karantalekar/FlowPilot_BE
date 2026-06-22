"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireTenant = void 0;
const http_status_1 = __importDefault(require("http-status"));
const api_error_1 = require("../utils/api-error");
const requireTenant = (req, _res, next) => {
    if (!req.auth?.organizationId)
        throw new api_error_1.ApiError(http_status_1.default.FORBIDDEN, 'Organization context required');
    req.tenantId = req.auth.organizationId;
    next();
};
exports.requireTenant = requireTenant;
