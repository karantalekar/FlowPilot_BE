"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformAdmin = void 0;
const bcrypt = require("bcryptjs");
const mongoose_1 = require("mongoose");
const env_1 = require("../config/env");

const platformAdminSchema = new mongoose_1.Schema({
    singletonKey: { type: String, default: 'platform-owner', unique: true, immutable: true, select: false },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['platform_super_admin'], default: 'platform_super_admin', immutable: true },
    status: { type: String, enum: ['active', 'disabled'], default: 'active' },
    refreshTokenHash: { type: String, select: false },
    sessionVersion: { type: Number, default: 0, select: false },
    lastLoginAt: Date,
    lastLoginIp: String,
    failedLoginAttempts: { type: Number, default: 0, select: false },
    lockedUntil: { type: Date, select: false }
}, { timestamps: true, collection: 'platform_admins' });
platformAdminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, env_1.env.BCRYPT_SALT_ROUNDS);
    next();
});
platformAdminSchema.methods.comparePassword = function (candidate) { return bcrypt.compare(candidate, this.password); };
platformAdminSchema.set('toJSON', { transform: (_doc, ret) => { delete ret.password; delete ret.refreshTokenHash; delete ret.sessionVersion; return ret; } });
exports.PlatformAdmin = (0, mongoose_1.model)('PlatformAdmin', platformAdminSchema);
