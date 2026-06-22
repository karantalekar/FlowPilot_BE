"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = void 0;
const mongoose_1 = require("mongoose");
const projectSchema = new mongoose_1.Schema({
    organization: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: String,
    status: {
        type: String,
        enum: ['planned', 'active', 'on_hold', 'completed', 'archived'],
        default: 'planned'
    },
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    invitations: [{
            user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
            invitedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
            status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
            respondedAt: Date
        }],
    startDate: Date,
    dueDate: Date
}, { timestamps: true });
projectSchema.index({ organization: 1, status: 1 });
exports.Project = (0, mongoose_1.model)('Project', projectSchema);
