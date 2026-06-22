"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_1 = require("mongoose");
const env_1 = require("../config/env");
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    role: { type: String, enum: ['super_admin', 'admin', 'manager', 'employee'], default: 'employee' },
    provider: { type: String, enum: ['local', 'google'], default: 'local' },
    organization: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization' },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    refreshTokenHash: { type: String, select: false },
    lastLoginAt: Date
}, { timestamps: true });
userSchema.pre('save', async function hashPassword(next) {
    if (!this.isModified('password') || !this.password)
        return next();
    this.password = await bcryptjs_1.default.hash(this.password, env_1.env.BCRYPT_SALT_ROUNDS);
    next();
});
userSchema.methods.comparePassword = function comparePassword(candidate) {
    return bcryptjs_1.default.compare(candidate, this.password);
};
userSchema.index({ organization: 1, role: 1 });
exports.User = (0, mongoose_1.model)('User', userSchema);
