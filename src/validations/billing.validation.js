"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitUpiPaymentSchema = exports.verifyPaymentSchema = exports.checkoutSchema = void 0;
const zod_1 = require("zod");
exports.checkoutSchema = zod_1.z.object({
    body: zod_1.z.object({
        plan: zod_1.z.enum(['pro', 'business'])
    })
});

exports.verifyPaymentSchema = zod_1.z.object({ body: zod_1.z.object({ razorpay_payment_id: zod_1.z.string().min(1), razorpay_subscription_id: zod_1.z.string().min(1), razorpay_signature: zod_1.z.string().min(1) }) });
exports.submitUpiPaymentSchema = zod_1.z.object({
    body: zod_1.z.object({
        plan: zod_1.z.enum(['pro', 'business']),
        transactionId: zod_1.z.string().trim().regex(/^[A-Za-z0-9]{8,35}$/, 'Enter a valid 8–35 character UPI transaction ID')
    })
});
