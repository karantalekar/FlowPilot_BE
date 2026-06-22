"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentHistory = void 0;
const mongoose_1 = require("mongoose");
const paymentHistorySchema = new mongoose_1.Schema({
    organization: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    razorpayPaymentId: { type: String, unique: true, sparse: true },
    razorpaySubscriptionId: String,
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { type: String, required: true },
    hostedInvoiceUrl: String,
    paidAt: Date
}, { timestamps: true });
exports.PaymentHistory = (0, mongoose_1.model)('PaymentHistory', paymentHistorySchema);
