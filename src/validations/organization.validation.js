"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memberActionSchema = exports.updateMemberSchema = exports.inviteMemberSchema = exports.updateOrganizationSchema = exports.createOrganizationSchema = void 0;
const zod_1 = require("zod");
const common_validation_1 = require("./common.validation");
exports.createOrganizationSchema = zod_1.z.object({ body: zod_1.z.object({ name: zod_1.z.string().min(2) }) });
exports.updateOrganizationSchema = zod_1.z.object({ params: common_validation_1.idParam, body: zod_1.z.object({ name: zod_1.z.string().min(2).optional() }) });
exports.inviteMemberSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2),
        email: zod_1.z.string().email(),
        role: zod_1.z.enum(['admin', 'manager', 'employee']).default('employee')
    })
});
exports.updateMemberSchema = zod_1.z.object({
    params: zod_1.z.object({ memberId: common_validation_1.objectId }),
    body: zod_1.z.object({
        name: zod_1.z.string().trim().min(2).optional(),
        email: zod_1.z.string().trim().email().optional(),
        role: zod_1.z.enum(['admin', 'manager', 'employee']).optional()
    }).refine((body) => Object.keys(body).length > 0, { message: 'At least one member field is required' })
});
exports.memberActionSchema = zod_1.z.object({ params: zod_1.z.object({ memberId: common_validation_1.objectId }) });
