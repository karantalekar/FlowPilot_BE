"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listConversationSchema = exports.generateReportSchema = exports.askDocumentSchema = exports.chatSchema = void 0;
const zod_1 = require("zod");
const common_validation_1 = require("./common.validation");
exports.chatSchema = zod_1.z.object({
    body: zod_1.z.object({
        message: zod_1.z.string().min(1),
        conversationId: common_validation_1.objectId.optional()
    })
});
exports.askDocumentSchema = zod_1.z.object({
    body: zod_1.z.object({
        question: zod_1.z.string().min(1),
        documentId: common_validation_1.objectId.optional()
    })
});
exports.generateReportSchema = zod_1.z.object({
    body: zod_1.z.object({
        type: zod_1.z.enum(['revenue', 'crm', 'projects', 'productivity', 'custom']),
        prompt: zod_1.z.string().optional()
    })
});
exports.listConversationSchema = zod_1.z.object({ query: common_validation_1.paginationQuery });
