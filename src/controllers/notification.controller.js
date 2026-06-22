"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationController = void 0;
const notification_service_1 = require("../services/notification.service");
const async_handler_1 = require("../utils/async-handler");
const api_response_1 = require("../utils/api-response");
exports.notificationController = {
    list: (0, async_handler_1.asyncHandler)(async (req, res) => {
        const result = await notification_service_1.notificationService.list(req.tenantId, req.auth.userId, req.query);
        (0, api_response_1.sendSuccess)(res, result.items, 'Notifications fetched', 200, { pagination: result.pagination });
    }),
    read: (0, async_handler_1.asyncHandler)(async (req, res) => {
        (0, api_response_1.sendSuccess)(res, await notification_service_1.notificationService.markRead(req.tenantId, req.auth.userId, req.params.id), 'Notification marked read');
    }),
    readAll: (0, async_handler_1.asyncHandler)(async (req, res) => {
        (0, api_response_1.sendSuccess)(res, await notification_service_1.notificationService.markAllRead(req.tenantId, req.auth.userId), 'Notifications marked read');
    })
};
