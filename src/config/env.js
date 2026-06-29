"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const normalizeUrl = (value) => value.trim().replace(/\/+$/, '');
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    PORT: zod_1.z.coerce.number().default(5000),
    APP_NAME: zod_1.z.string().default('FlowPilot'),
    CLIENT_URL: zod_1.z.string().default('http://localhost:3000').transform(normalizeUrl),
    API_BASE_URL: zod_1.z.string().default('http://localhost:5000').transform(normalizeUrl),
    MONGODB_URI: zod_1.z.string().min(1).default('mongodb://localhost:27017/flowpilot'),
    REDIS_URL: zod_1.z.string().default('redis://localhost:6379'),
    JWT_ACCESS_SECRET: zod_1.z.string().min(12).default('development-access-secret'),
    JWT_REFRESH_SECRET: zod_1.z.string().min(12).default('development-refresh-secret'),
    JWT_ACCESS_EXPIRES_IN: zod_1.z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().default('30d'),
    COOKIE_SECRET: zod_1.z.string().default('change-me'),
    BCRYPT_SALT_ROUNDS: zod_1.z.coerce.number().default(12),
    GOOGLE_CLIENT_ID: zod_1.z.string().optional(),
    GOOGLE_CLIENT_SECRET: zod_1.z.string().optional(),
    GOOGLE_CALLBACK_URL: zod_1.z.string().optional(),
    GEMINI_API_KEY: zod_1.z.string().optional(),
    GEMINI_MODEL: zod_1.z.string().default('gemini-2.5-flash'),
    RAZORPAY_KEY_ID: zod_1.z.string().optional(),
    RAZORPAY_KEY_SECRET: zod_1.z.string().optional(),
    RAZORPAY_WEBHOOK_SECRET: zod_1.z.string().optional(),
    RAZORPAY_PLAN_PRO: zod_1.z.string().optional(),
    RAZORPAY_PLAN_BUSINESS: zod_1.z.string().optional(),
    SMTP_HOST: zod_1.z.string().optional(),
    SMTP_PORT: zod_1.z.coerce.number().default(587),
    SMTP_SECURE: zod_1.z.coerce.boolean().default(false),
    SMTP_TIMEOUT_MS: zod_1.z.coerce.number().default(15000),
    SMTP_USER: zod_1.z.string().optional(),
    SMTP_PASS: zod_1.z.string().optional(),
    EMAIL_FROM: zod_1.z.string().default('no-reply@flowpilot.local'),
    UPLOAD_DIR: zod_1.z.string().default('uploads'),
    MAX_FILE_SIZE_MB: zod_1.z.coerce.number().default(20)
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('Invalid environment variables', parsed.error.flatten().fieldErrors);
    process.exit(1);
}
if (parsed.data.NODE_ENV === 'production') {
    const insecureSecrets = [
        ['JWT_ACCESS_SECRET', parsed.data.JWT_ACCESS_SECRET],
        ['JWT_REFRESH_SECRET', parsed.data.JWT_REFRESH_SECRET],
        ['COOKIE_SECRET', parsed.data.COOKIE_SECRET]
    ].filter(([, value]) => !value || value.length < 32 || /development|change-me|replace-with/i.test(value));
    if (insecureSecrets.length) {
        console.error(`Production secrets must be unique random values of at least 32 characters: ${insecureSecrets.map(([name]) => name).join(', ')}`);
        process.exit(1);
    }
    if (!parsed.data.CLIENT_URL.startsWith('https://')) {
        console.error('CLIENT_URL must use HTTPS in production');
        process.exit(1);
    }
}
exports.env = parsed.data;
