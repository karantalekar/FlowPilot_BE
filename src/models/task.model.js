"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
const mongoose_1 = require("mongoose");
const taskSchema = new mongoose_1.Schema({
    organization: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    project: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: String,
    status: {
        type: String,
        enum: ['backlog', 'todo', 'in_progress', 'review', 'done'],
        default: 'todo',
        index: true
    },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    assignees: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    dueDate: Date,
    comments: [
        {
            author: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
            body: { type: String, required: true },
            createdAt: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });
taskSchema.index({ organization: 1, project: 1, status: 1 });
exports.Task = (0, mongoose_1.model)('Task', taskSchema);
