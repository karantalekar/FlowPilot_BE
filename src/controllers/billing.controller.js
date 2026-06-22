"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.billingController = void 0;
const billing_service_1 = require("../services/billing.service");
const async_handler_1 = require("../utils/async-handler");
const api_response_1 = require("../utils/api-response");
exports.billingController = {
    createSubscription: (0, async_handler_1.asyncHandler)(async (req, res) => {
        (0, api_response_1.sendSuccess)(res, await billing_service_1.billingService.createSubscription(req.tenantId, req.body.plan));
    }),
    verifyPayment: (0, async_handler_1.asyncHandler)(async (req, res) => {
        (0, api_response_1.sendSuccess)(res, await billing_service_1.billingService.verifyPayment(req.tenantId, req.body));
    }),
    webhook: (0, async_handler_1.asyncHandler)(async (req, res) => {
        (0, api_response_1.sendSuccess)(res, await billing_service_1.billingService.handleWebhook(req.body, req.headers['x-razorpay-signature']));
    }),
    subscription: (0, async_handler_1.asyncHandler)(async (req, res) => {
        (0, api_response_1.sendSuccess)(res, await billing_service_1.billingService.subscription(req.tenantId));
    }),
    paymentHistory: (0, async_handler_1.asyncHandler)(async (req, res) => {
        (0, api_response_1.sendSuccess)(res, await billing_service_1.billingService.paymentHistory(req.tenantId));
    })
};
