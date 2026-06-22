"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiUsageService = void 0;
const http_status_1 = require("http-status");
const ai_model_1 = require("../models/ai.model");
const api_error_1 = require("../utils/api-error");

const DAILY_PROMPT_LIMIT = 5;
const utcDay = (date = new Date()) => date.toISOString().slice(0, 10);
const nextUtcDay = (date = new Date()) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1));
const result = (used) => ({ limit: DAILY_PROMPT_LIMIT, used, remaining: DAILY_PROMPT_LIMIT - used, resetsAt: nextUtcDay() });

exports.aiUsageService = {
    async consume(organizationId, userId) {
        const day = utcDay();
        try {
            const usage = await ai_model_1.DailyAIUsage.findOneAndUpdate({ organization: organizationId, user: userId, day, prompts: { $lt: DAILY_PROMPT_LIMIT } }, { $inc: { prompts: 1 }, $setOnInsert: { organization: organizationId, user: userId, day } }, { new: true, upsert: true });
            return result(usage.prompts);
        }
        catch (error) {
            if (error?.code === 11000)
                throw new api_error_1.ApiError(http_status_1.TOO_MANY_REQUESTS, 'Daily AI prompt limit reached. You can send 5 prompts per day; your limit resets at 00:00 UTC.');
            throw error;
        }
    },
    async current(organizationId, userId) {
        const usage = await ai_model_1.DailyAIUsage.findOne({ organization: organizationId, user: userId, day: utcDay() });
        return result(Math.min(usage?.prompts || 0, DAILY_PROMPT_LIMIT));
    }
};
