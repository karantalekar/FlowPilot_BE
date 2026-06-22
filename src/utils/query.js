"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRegexSearch = void 0;
const buildRegexSearch = (search, fields) => {
    if (!search || typeof search !== 'string')
        return {};
    return {
        $or: fields.map((field) => ({
            [field]: { $regex: search, $options: 'i' }
        }))
    };
};
exports.buildRegexSearch = buildRegexSearch;
