"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ai_service_1 = require("../services/ai.service");
const api_error_1 = require("../utils/api-error");
const async_handler_1 = require("../utils/async-handler");
const api_response_1 = require("../utils/api-response");
exports.aiController = {
    chat: (0, async_handler_1.asyncHandler)(async (req, res) => {
        const result = await ai_service_1.aiService.chat(req.tenantId, req.auth.userId, req.body.message, req.body.conversationId);
        (0, api_response_1.sendSuccess)(res, result);
    }),
    conversations: (0, async_handler_1.asyncHandler)(async (req, res) => {
        (0, api_response_1.sendSuccess)(res, await ai_service_1.aiService.listConversations(req.tenantId, req.auth.userId));
    }),
    uploadDocument: (0, async_handler_1.asyncHandler)(async (req, res) => {
        if (!req.file)
            throw new api_error_1.ApiError(http_status_1.default.BAD_REQUEST, 'Document is required');
        const document = await ai_service_1.aiService.uploadDocument(req.tenantId, req.auth.userId, req.file);
        (0, api_response_1.sendSuccess)(res, document, 'Document uploaded', http_status_1.default.CREATED);
    }),
    askDocument: (0, async_handler_1.asyncHandler)(async (req, res) => {
        (0, api_response_1.sendSuccess)(res, await ai_service_1.aiService.askDocument(req.tenantId, req.body.question, req.body.documentId));
    }),
    generateReport: (0, async_handler_1.asyncHandler)(async (req, res) => {
        (0, api_response_1.sendSuccess)(res, await ai_service_1.aiService.generateReport(req.tenantId, req.body.type, req.body.prompt));
    })
};
