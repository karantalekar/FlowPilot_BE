const { getTrialStatus } = require('../middlewares/subscription.middleware');

describe('free trial status', () => {
    it('keeps a free workspace active during its seven-day trial', () => {
        const createdAt = new Date('2026-01-01T00:00:00.000Z');
        const status = getTrialStatus({ plan: 'free', createdAt }, new Date('2026-01-06T00:00:00.000Z'));
        expect(status.trialExpired).toBe(false);
        expect(status.trialDaysRemaining).toBe(2);
    });

    it('expires a free workspace after seven days but never expires a paid plan', () => {
        const createdAt = new Date('2026-01-01T00:00:00.000Z');
        expect(getTrialStatus({ plan: 'free', createdAt }, new Date('2026-01-08T00:00:00.000Z')).trialExpired).toBe(true);
        expect(getTrialStatus({ plan: 'pro', createdAt }, new Date('2027-01-01T00:00:00.000Z')).trialExpired).toBe(false);
    });
});
