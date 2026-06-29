"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
const logger_1 = require("../config/logger");
const smtpPassword = env_1.env.SMTP_HOST?.includes('gmail')
    ? env_1.env.SMTP_PASS?.replace(/\s+/g, '')
    : env_1.env.SMTP_PASS;
const transporter = env_1.env.SMTP_HOST && env_1.env.SMTP_USER && env_1.env.SMTP_PASS
    ? nodemailer_1.default.createTransport({
        host: env_1.env.SMTP_HOST,
        port: env_1.env.SMTP_PORT,
        secure: env_1.env.SMTP_SECURE,
        auth: { user: env_1.env.SMTP_USER, pass: smtpPassword },
        connectionTimeout: env_1.env.SMTP_TIMEOUT_MS,
        greetingTimeout: env_1.env.SMTP_TIMEOUT_MS,
        socketTimeout: env_1.env.SMTP_TIMEOUT_MS
    })
    : null;
exports.emailService = {
    async send(to, subject, html, attachments = []) {
        if (!transporter) {
            logger_1.logger.info(`Email skipped: ${subject} -> ${to}`);
            return false;
        }
        try {
            await transporter.sendMail({ from: env_1.env.EMAIL_FROM, to, subject, html, attachments });
            return true;
        }
        catch (error) {
            logger_1.logger.error(`Email failed: ${subject} -> ${to}`, error);
            return false;
        }
    },
    sendVerificationEmail(email, token) {
        return this.send(email, 'Verify your FlowPilot email', `<p>Use this token to verify your email: ${token}</p>`);
    },
    sendPasswordResetEmail(email, token) {
        const resetUrl = `${env_1.env.CLIENT_URL.replace(/\/$/, '')}/auth/reset-password?token=${encodeURIComponent(token)}`;
        return this.send(email, 'Reset your FlowPilot password', `
<p>You requested a password reset for your FlowPilot account.</p>
<p><a href="${resetUrl}">Reset your password</a></p>
<p>This password reset link expires in 30 minutes.</p>
<p>If you did not request this, you can safely ignore this email.</p>
`);
    }
};
