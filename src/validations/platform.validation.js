"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.platformValidation = void 0;
const { z } = require("zod");
const id = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');
const query = z.object({
    page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(100).optional(), status: z.string().trim().max(30).optional(), sort: z.string().max(40).optional()
});
exports.platformValidation = {
    register: z.object({ body: z.object({
        name: z.string().trim().min(2).max(80),
        email: z.string().email().transform(v => v.toLowerCase()),
        password: z.string().min(12).max(128)
            .regex(/[a-z]/, 'Password must contain a lowercase letter')
            .regex(/[A-Z]/, 'Password must contain an uppercase letter')
            .regex(/[0-9]/, 'Password must contain a number')
            .regex(/[^A-Za-z0-9]/, 'Password must contain a special character')
    }) }),
    login: z.object({ body: z.object({ email: z.string().email().transform(v => v.toLowerCase()), password: z.string().min(12).max(128) }) }),
    refresh: z.object({ body: z.object({ refreshToken: z.string().min(20) }) }),
    list: z.object({ query }),
    id: z.object({ params: z.object({ id }) }),
    organizationStatus: z.object({ params: z.object({ id }), body: z.object({ status: z.enum(['active', 'suspended']), reason: z.string().trim().max(500).optional() }) }),
    plan: z.object({ body: z.object({
        name: z.string().trim().min(2).max(80), code: z.string().trim().regex(/^[a-z0-9-]+$/),
        description: z.string().max(500).optional(), status: z.enum(['active', 'inactive']).default('active'),
        pricing: z.object({ monthly: z.number().nonnegative(), yearly: z.number().nonnegative(), currency: z.string().length(3).default('INR') }),
        trialDays: z.number().int().min(0).max(365).default(0),
        features: z.array(z.object({ key: z.string().max(60), label: z.string().max(100), enabled: z.boolean(), limit: z.number().int().nonnegative().optional() })).max(100).default([])
    }) }),
    planUpdate: z.object({ params: z.object({ id }), body: z.object({
        name: z.string().trim().min(2).max(80).optional(), description: z.string().max(500).optional(),
        status: z.enum(['active', 'inactive']).optional(), pricing: z.object({ monthly: z.number().nonnegative(), yearly: z.number().nonnegative(), currency: z.string().length(3) }).optional(),
        trialDays: z.number().int().min(0).max(365).optional(),
        features: z.array(z.object({ key: z.string(), label: z.string(), enabled: z.boolean(), limit: z.number().int().nonnegative().optional() })).max(100).optional()
    }).refine(v => Object.keys(v).length > 0, 'At least one field is required') }),
    paymentDecision: z.object({ params: z.object({ id }), body: z.object({ decision: z.enum(['verified', 'rejected']), reason: z.string().trim().max(500).optional() }).refine(v => v.decision !== 'rejected' || !!v.reason, 'A rejection reason is required') }),
    subscriptionAction: z.object({ params: z.object({ id }), body: z.object({
        action: z.enum(['renew', 'extend', 'suspend', 'cancel', 'change_plan']),
        days: z.number().int().min(1).max(3660).optional(), planId: id.optional(), billingCycle: z.enum(['monthly', 'yearly', 'custom']).optional()
    }) }),
    invoiceStatus: z.object({ params: z.object({ id }), body: z.object({ status: z.enum(['paid', 'unpaid', 'void']) }) }),
    setting: z.object({ body: z.object({ key: z.string().regex(/^[a-z][a-z0-9._-]+$/), value: z.unknown() }) })
};
