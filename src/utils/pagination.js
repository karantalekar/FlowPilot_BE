"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginate = exports.getPagination = void 0;
const getPagination = (query) => {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};
exports.getPagination = getPagination;
const paginate = async (model, filter, query, options = {}) => {
    const { page, limit, skip } = (0, exports.getPagination)(query);
    const sort = typeof query.sort === 'string' ? query.sort : '-createdAt';
    const [items, total] = await Promise.all([
        model.find(filter, null, { ...options, sort, skip, limit }),
        model.countDocuments(filter)
    ]);
    return {
        items,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};
exports.paginate = paginate;
