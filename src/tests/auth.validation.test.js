"use strict";
const { registerSchema } = require("../validations/auth.validation");

describe('auth validation', () => {
    it('accepts a valid admin registration payload', () => {
        const result = registerSchema.safeParse({
            body: { name: 'Test User', email: 'admin@example.com', password: 'Password123!' }
        });
        expect(result.success).toBe(true);
    });

    it('rejects a weak password', () => {
        const result = registerSchema.safeParse({
            body: { name: 'Test User', email: 'admin@example.com', password: 'short' }
        });
        expect(result.success).toBe(false);
    });

    it('rejects public registration without the admin keyword', () => {
        const result = registerSchema.safeParse({
            body: { name: 'Test User', email: 'owner@example.com', password: 'Password123!' }
        });
        expect(result.success).toBe(false);
    });
});
