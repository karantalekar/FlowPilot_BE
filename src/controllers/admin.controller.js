"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = void 0;
const admin_service_1 = require("../services/admin.service");
const async_handler_1 = require("../utils/async-handler");
const api_response_1 = require("../utils/api-response");
exports.adminController = {
    users: (0, async_handler_1.asyncHandler)(async (req, res) => {
        const result = await admin_service_1.adminService.users(req.query);
        (0, api_response_1.sendSuccess)(res, result.items, 'Users fetched', 200, { pagination: result.pagination });
    }),
    organizations: (0, async_handler_1.asyncHandler)(async (req, res) => {
        const result = await admin_service_1.adminService.organizations(req.query);
        (0, api_response_1.sendSuccess)(res, result.items, 'Organizations fetched', 200, { pagination: result.pagination });
    }),
    subscriptions: (0, async_handler_1.asyncHandler)(async (req, res) => {
        const result = await admin_service_1.adminService.subscriptions(req.query);
        (0, api_response_1.sendSuccess)(res, result.items, 'Subscriptions fetched', 200, { pagination: result.pagination });
    }),
    auditLogs: (0, async_handler_1.asyncHandler)(async (req, res) => {
        const result = await admin_service_1.adminService.auditLogs(req.query);
        (0, api_response_1.sendSuccess)(res, result.items, 'Audit logs fetched', 200, { pagination: result.pagination });
    }),
    stats: (0, async_handler_1.asyncHandler)(async (_req, res) => (0, api_response_1.sendSuccess)(res, await admin_service_1.adminService.stats()))
};
