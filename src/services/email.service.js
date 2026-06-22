"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
const logger_1 = require("../config/logger");
const transporter = env_1.env.SMTP_HOST && env_1.env.SMTP_USER && env_1.env.SMTP_PASS
    ? nodemailer_1.default.createTransport({
        host: env_1.env.SMTP_HOST,
        port: env_1.env.SMTP_PORT,
        secure: env_1.env.SMTP_PORT === 465,
        auth: { user: env_1.env.SMTP_USER, pass: env_1.env.SMTP_PASS }
    })
    : null;
exports.emailService = {
    async send(to, subject, html) {
        if (!transporter) {
            logger_1.logger.info(`Email skipped: ${subject} -> ${to}`);
            return false;
        }
        await transporter.sendMail({ from: env_1.env.EMAIL_FROM, to, subject, html });
        return true;
    },
    sendVerificationEmail(email, token) {
        return this.send(email, 'Verify your FlowPilot email', `<p>Use this token to verify your email: ${token}</p>`);
    },
    sendPasswordResetEmail(email, token) {
        return this.send(email, 'Reset your FlowPilot password', `<p>Use this token to reset your password: ${token}</p>`);
    }
};
