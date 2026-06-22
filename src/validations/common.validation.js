"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idParam = exports.paginationQuery = exports.objectId = void 0;
const zod_1 = require("zod");
exports.objectId = zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');
exports.paginationQuery = zod_1.z.object({
    page: zod_1.z.string().optional(),
    limit: zod_1.z.string().optional(),
    sort: zod_1.z.string().optional(),
    search: zod_1.z.string().optional()
});
exports.idParam = zod_1.z.object({ id: exports.objectId });
