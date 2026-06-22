"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectMemberActionSchema = exports.respondInvitationSchema = exports.inviteProjectMemberSchema = exports.updateTaskSchema = exports.listTaskSchema = exports.createTaskSchema = exports.taskBody = exports.updateProjectSchema = exports.listProjectSchema = exports.createProjectSchema = exports.projectBody = void 0;
const zod_1 = require("zod");
const common_validation_1 = require("./common.validation");
exports.projectBody = zod_1.z.object({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    status: zod_1.z.enum(['planned', 'active', 'on_hold', 'completed', 'archived']).optional(),
    startDate: zod_1.z.coerce.date().optional(),
    dueDate: zod_1.z.coerce.date().optional()
});
exports.createProjectSchema = zod_1.z.object({ body: exports.projectBody });
exports.listProjectSchema = zod_1.z.object({ query: common_validation_1.paginationQuery.extend({ status: zod_1.z.string().optional() }) });
exports.updateProjectSchema = zod_1.z.object({ params: common_validation_1.idParam, body: exports.projectBody.partial() });
exports.inviteProjectMemberSchema = zod_1.z.object({ params: common_validation_1.idParam, body: zod_1.z.object({ userId: common_validation_1.objectId }) });
exports.respondInvitationSchema = zod_1.z.object({ params: zod_1.z.object({ id: common_validation_1.objectId, invitationId: common_validation_1.objectId }), body: zod_1.z.object({ status: zod_1.z.enum(['accepted', 'rejected']) }) });
exports.projectMemberActionSchema = zod_1.z.object({ params: zod_1.z.object({ id: common_validation_1.objectId, userId: common_validation_1.objectId }) });
exports.taskBody = zod_1.z.object({
    project: common_validation_1.objectId,
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    status: zod_1.z.enum(['backlog', 'todo', 'in_progress', 'review', 'done']).optional(),
    priority: zod_1.z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    assignees: zod_1.z.array(common_validation_1.objectId).optional(),
    dueDate: zod_1.z.coerce.date().optional()
});
exports.createTaskSchema = zod_1.z.object({ body: exports.taskBody });
exports.listTaskSchema = zod_1.z.object({
    query: common_validation_1.paginationQuery.extend({ project: common_validation_1.objectId.optional(), status: zod_1.z.string().optional() })
});
exports.updateTaskSchema = zod_1.z.object({
    params: common_validation_1.idParam,
    body: exports.taskBody.partial().extend({ comment: zod_1.z.string().optional() })
});
