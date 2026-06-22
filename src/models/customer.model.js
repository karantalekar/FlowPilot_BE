"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Customer = void 0;
const mongoose_1 = require("mongoose");
const customerSchema = new mongoose_1.Schema({
    organization: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: String,
    company: String,
    lifetimeValue: { type: Number, default: 0 },
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    tags: [{ type: String, trim: true }]
}, { timestamps: true });
customerSchema.index({ organization: 1, name: 'text', email: 'text', company: 'text' });
exports.Customer = (0, mongoose_1.model)('Customer', customerSchema);
