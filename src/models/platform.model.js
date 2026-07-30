"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformSetting = exports.PlatformActivity = exports.Invoice = exports.PlatformPayment = exports.Subscription = exports.Plan = void 0;
const mongoose_1 = require("mongoose");
const { Schema, model } = mongoose_1;

const planSchema = new Schema({
    name: { type: String, required: true, trim: true }, code: { type: String, required: true, unique: true, lowercase: true },
    description: String, status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
    pricing: { monthly: { type: Number, min: 0, required: true }, yearly: { type: Number, min: 0, required: true }, currency: { type: String, default: 'INR' } },
    trialDays: { type: Number, min: 0, max: 365, default: 0 }, features: [{ key: String, label: String, enabled: Boolean, limit: Number }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'PlatformAdmin' }
}, { timestamps: true });
const subscriptionSchema = new Schema({
    organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    plan: { type: Schema.Types.ObjectId, ref: 'Plan', required: true },
    status: { type: String, enum: ['trialing', 'active', 'expired', 'suspended', 'canceled'], default: 'trialing', index: true },
    billingCycle: { type: String, enum: ['monthly', 'yearly', 'custom'], default: 'monthly' },
    startsAt: { type: Date, required: true }, expiresAt: { type: Date, required: true, index: true },
    renewalHistory: [{ renewedAt: Date, previousExpiry: Date, newExpiry: Date, amount: Number, actor: { type: Schema.Types.ObjectId, ref: 'PlatformAdmin' } }]
}, { timestamps: true });
const paymentSchema = new Schema({
    organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    payer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subscription: { type: Schema.Types.ObjectId, ref: 'Subscription' }, amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' }, method: String,
    plan: { type: String, enum: ['pro', 'business'] },
    transactionId: { type: String, required: true, unique: true, trim: true },
    status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending', index: true },
    proof: { storageKey: String, originalName: String, mimeType: String, size: Number },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'PlatformAdmin' }, verifiedAt: Date, rejectionReason: String
}, { timestamps: true });
const invoiceSchema = new Schema({
    number: { type: String, required: true, unique: true }, organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    subscription: { type: Schema.Types.ObjectId, ref: 'Subscription' }, payment: { type: Schema.Types.ObjectId, ref: 'PlatformPayment' },
    status: { type: String, enum: ['draft', 'issued', 'paid', 'unpaid', 'void'], default: 'draft', index: true },
    currency: { type: String, default: 'INR' }, subtotal: Number, tax: Number, total: Number, dueAt: Date, paidAt: Date,
    lineItems: [{ description: String, quantity: Number, unitPrice: Number, amount: Number }],
    sentAt: Date, recipients: [String]
}, { timestamps: true });
invoiceSchema.index({ payment: 1 }, { unique: true, sparse: true });
const activitySchema = new Schema({
    actor: { type: Schema.Types.ObjectId, ref: 'PlatformAdmin', required: true, index: true },
    action: { type: String, required: true, index: true }, entity: { type: String, required: true },
    entityId: Schema.Types.ObjectId, ip: String, userAgent: String, requestId: String, metadata: Schema.Types.Mixed
}, { timestamps: true, collection: 'platform_activity_logs' });
const settingSchema = new Schema({ key: { type: String, unique: true }, value: Schema.Types.Mixed, updatedBy: { type: Schema.Types.ObjectId, ref: 'PlatformAdmin' } }, { timestamps: true });
exports.Plan = model('Plan', planSchema);
exports.Subscription = model('Subscription', subscriptionSchema);
exports.PlatformPayment = model('PlatformPayment', paymentSchema);
exports.Invoice = model('Invoice', invoiceSchema);
exports.PlatformActivity = model('PlatformActivity', activitySchema);
exports.PlatformSetting = model('PlatformSetting', settingSchema);
