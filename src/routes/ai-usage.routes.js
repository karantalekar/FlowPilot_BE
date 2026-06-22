"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiUsageRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const tenant_middleware_1 = require("../middlewares/tenant.middleware");
const subscription_middleware_1 = require("../middlewares/subscription.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const ai_validation_1 = require("../validations/ai.validation");
const ai_usage_service_1 = require("../services/ai-usage.service");
const async_handler_1 = require("../utils/async-handler");
const api_response_1 = require("../utils/api-response");

exports.aiUsageRouter = (0, express_1.Router)();
exports.aiUsageRouter.use(auth_middleware_1.authenticate, tenant_middleware_1.requireTenant, subscription_middleware_1.requireActiveSubscription);
exports.aiUsageRouter.get('/usage', (0, async_handler_1.asyncHandler)(async (req, res) => {
    (0, api_response_1.sendSuccess)(res, await ai_usage_service_1.aiUsageService.current(req.tenantId, req.auth.userId));
}));
const consumePrompt = (0, async_handler_1.asyncHandler)(async (req, _res, next) => {
    await ai_usage_service_1.aiUsageService.consume(req.tenantId, req.auth.userId);
    next();
});
exports.aiUsageRouter.post('/chat', (0, validate_middleware_1.validate)(ai_validation_1.chatSchema), consumePrompt);
exports.aiUsageRouter.post('/documents/ask', (0, validate_middleware_1.validate)(ai_validation_1.askDocumentSchema), consumePrompt);
exports.aiUsageRouter.post('/reports/generate', (0, validate_middleware_1.validate)(ai_validation_1.generateReportSchema), consumePrompt);
