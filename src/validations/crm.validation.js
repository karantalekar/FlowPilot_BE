"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomerSchema = exports.listCustomerSchema = exports.createCustomerSchema = exports.customerBody = exports.idSchema = exports.updateLeadSchema = exports.listLeadSchema = exports.createLeadSchema = exports.leadBody = void 0;
const zod_1 = require("zod");
const common_validation_1 = require("./common.validation");
exports.leadBody = zod_1.z.object({
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().optional(),
    company: zod_1.z.string().optional(),
    status: zod_1.z.enum(['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']).optional(),
    source: zod_1.z.string().optional(),
    value: zod_1.z.number().nonnegative().optional(),
    owner: zod_1.z.string().optional(),
    followUpAt: zod_1.z.coerce.date().optional(),
    notes: zod_1.z.string().optional()
});
exports.createLeadSchema = zod_1.z.object({ body: exports.leadBody });
exports.listLeadSchema = zod_1.z.object({
    query: common_validation_1.paginationQuery.extend({ status: zod_1.z.string().optional(), owner: zod_1.z.string().optional() })
});
exports.updateLeadSchema = zod_1.z.object({ params: common_validation_1.idParam, body: exports.leadBody.partial() });
exports.idSchema = zod_1.z.object({ params: common_validation_1.idParam });
exports.customerBody = zod_1.z.object({
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().optional(),
    company: zod_1.z.string().optional(),
    lifetimeValue: zod_1.z.number().nonnegative().optional(),
    owner: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional()
});
exports.createCustomerSchema = zod_1.z.object({ body: exports.customerBody });
exports.updateCustomerSchema = zod_1.z.object({ params: common_validation_1.idParam, body: exports.customerBody.partial() });
exports.listCustomerSchema = zod_1.z.object({ query: common_validation_1.paginationQuery });
