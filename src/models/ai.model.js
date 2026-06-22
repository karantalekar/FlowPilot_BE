"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DailyAIUsage = exports.AIDocument = exports.Conversation = void 0;
const mongoose_1 = require("mongoose");
const conversationSchema = new mongoose_1.Schema({
    organization: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: 'New conversation' },
    messages: [
        {
            role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
            content: { type: String, required: true },
            createdAt: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });
const dailyAIUsageSchema = new mongoose_1.Schema({
    organization: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true },
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    day: { type: String, required: true },
    prompts: { type: Number, default: 0, min: 0 }
}, { timestamps: true });
dailyAIUsageSchema.index({ organization: 1, user: 1, day: 1 }, { unique: true });
const aiDocumentSchema = new mongoose_1.Schema({
    organization: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    uploadedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    originalName: { type: String, required: true },
    path: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    chunks: [
        {
            index: Number,
            content: String,
            embedding: [Number]
        }
    ]
}, { timestamps: true });
aiDocumentSchema.index({ organization: 1, 'chunks.content': 'text' });
exports.Conversation = (0, mongoose_1.model)('Conversation', conversationSchema);
exports.AIDocument = (0, mongoose_1.model)('AIDocument', aiDocumentSchema);
exports.DailyAIUsage = (0, mongoose_1.model)('DailyAIUsage', dailyAIUsageSchema);
