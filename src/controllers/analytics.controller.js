"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsController = void 0;
const analytics_service_1 = require("../services/analytics.service");
const async_handler_1 = require("../utils/async-handler");
const api_response_1 = require("../utils/api-response");
exports.analyticsController = {
    dashboard: (0, async_handler_1.asyncHandler)(async (req, res) => (0, api_response_1.sendSuccess)(res, await analytics_service_1.analyticsService.dashboard(req.tenantId, req.auth.userId, req.auth.role))),
    crm: (0, async_handler_1.asyncHandler)(async (req, res) => (0, api_response_1.sendSuccess)(res, await analytics_service_1.analyticsService.crm(req.tenantId))),
    projects: (0, async_handler_1.asyncHandler)(async (req, res) => (0, api_response_1.sendSuccess)(res, await analytics_service_1.analyticsService.projects(req.tenantId, req.auth.userId, req.auth.role)))
};
