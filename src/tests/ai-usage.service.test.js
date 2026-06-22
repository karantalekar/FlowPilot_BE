jest.mock('../models/ai.model', () => ({
    DailyAIUsage: {
        findOneAndUpdate: jest.fn(),
        findOne: jest.fn()
    }
}));

const { DailyAIUsage } = require('../models/ai.model');
const { aiUsageService } = require('../services/ai-usage.service');

describe('daily AI prompt usage', () => {
    it('returns the remaining allowance after consuming a prompt', async () => {
        DailyAIUsage.findOneAndUpdate.mockResolvedValue({ prompts: 3 });
        await expect(aiUsageService.consume('org', 'user')).resolves.toMatchObject({ limit: 5, used: 3, remaining: 2 });
    });

    it('rejects prompts after the daily allowance is exhausted', async () => {
        DailyAIUsage.findOneAndUpdate.mockRejectedValue({ code: 11000 });
        await expect(aiUsageService.consume('org', 'user')).rejects.toMatchObject({ statusCode: 429 });
    });
});
