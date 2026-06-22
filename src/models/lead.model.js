"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lead = void 0;
const mongoose_1 = require("mongoose");
const leadSchema = new mongoose_1.Schema({
    organization: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: String,
    company: String,
    status: {
        type: String,
        enum: ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'],
        default: 'new',
        index: true
    },
    source: String,
    value: Number,
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    followUpAt: Date,
    notes: String
}, { timestamps: true });
leadSchema.index({ organization: 1, name: 'text', email: 'text', company: 'text' });
exports.Lead = (0, mongoose_1.model)('Lead', leadSchema);
