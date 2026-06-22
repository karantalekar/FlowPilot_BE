"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityLog = void 0;
const mongoose_1 = require("mongoose");
const activityLogSchema = new mongoose_1.Schema({
    organization: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', index: true },
    actor: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    entity: { type: String, required: true },
    entityId: { type: mongoose_1.Schema.Types.ObjectId },
    action: { type: String, required: true },
    metadata: mongoose_1.Schema.Types.Mixed
}, { timestamps: true });
exports.ActivityLog = (0, mongoose_1.model)('ActivityLog', activityLogSchema);
