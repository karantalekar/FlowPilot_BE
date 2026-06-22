"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const http_status_1 = __importDefault(require("http-status"));
const zod_1 = require("zod");
const api_error_1 = require("../utils/api-error");
const validate = (schema) => (req, _res, next) => {
    try {
        const parsed = schema.parse({
            body: req.body,
            query: req.query,
            params: req.params
        });
        req.body = parsed.body ?? req.body;
        req.query = parsed.query ?? req.query;
        req.params = parsed.params ?? req.params;
        next();
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            throw new api_error_1.ApiError(http_status_1.default.BAD_REQUEST, error.errors.map((issue) => issue.message).join(', '));
        }
        next(error);
    }
};
exports.validate = validate;
