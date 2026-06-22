"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleSchema = exports.acceptInviteSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.refreshTokenSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2),
        email: zod_1.z.string().email().refine((email) => email.split('@')[0].toLowerCase().includes('admin'), 'Not authorized to sign up'),
        password: zod_1.z.string().min(8),
        organizationName: zod_1.z.string().min(2).optional()
    })
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(1)
    })
});
exports.refreshTokenSchema = zod_1.z.object({
    body: zod_1.z.object({ refreshToken: zod_1.z.string().min(1) })
});
exports.forgotPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({ email: zod_1.z.string().email() })
});
exports.resetPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        token: zod_1.z.string().min(1),
        password: zod_1.z.string().min(8)
    })
});
exports.acceptInviteSchema = zod_1.z.object({
    body: zod_1.z.object({
        token: zod_1.z.string().min(1),
        password: zod_1.z.string().min(8)
    })
});
exports.googleSchema = zod_1.z.object({
    body: zod_1.z.object({
        googleIdToken: zod_1.z.string().min(1)
    })
});
