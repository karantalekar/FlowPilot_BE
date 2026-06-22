"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Organization = void 0;
const mongoose_1 = require("mongoose");
const organizationSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    plan: { type: String, enum: ['free', 'pro', 'business'], default: 'free' },
    trialEndsAt: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    subscriptionStatus: {
        type: String,
        enum: ['trialing', 'active', 'past_due', 'canceled', 'incomplete', 'none'],
        default: 'trialing'
    },
    razorpaySubscriptionId: String,
    usage: {
        aiMessages: { type: Number, default: 0 },
        documents: { type: Number, default: 0 },
        users: { type: Number, default: 1 }
    }
}, { timestamps: true });
exports.Organization = (0, mongoose_1.model)('Organization', organizationSchema);
