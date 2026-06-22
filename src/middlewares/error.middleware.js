"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFoundHandler = void 0;
const http_status_1 = __importDefault(require("http-status"));
const jsonwebtoken_1 = require("jsonwebtoken");
const mongoose_1 = require("mongoose");
const env_1 = require("../config/env");
const logger_1 = require("../config/logger");
const api_error_1 = require("../utils/api-error");
const notFoundHandler = (req, _res, next) => {
    next(new api_error_1.ApiError(http_status_1.default.NOT_FOUND, `Route not found: ${req.method} ${req.originalUrl}`));
};
exports.notFoundHandler = notFoundHandler;
const errorHandler = (error, _req, res, _next) => {
    let statusCode = error.statusCode || http_status_1.default.INTERNAL_SERVER_ERROR;
    let message = error.message || 'Internal server error';
    if (error instanceof mongoose_1.Error.ValidationError) {
        statusCode = http_status_1.default.BAD_REQUEST;
        message = error.message;
    }
    if (error instanceof jsonwebtoken_1.JsonWebTokenError || error instanceof jsonwebtoken_1.TokenExpiredError) {
        statusCode = http_status_1.default.UNAUTHORIZED;
        message = 'Invalid or expired token';
    }
    if (error.code === 11000) {
        statusCode = http_status_1.default.CONFLICT;
        message = 'Duplicate resource';
    }
    logger_1.logger.error(message, { stack: error.stack });
    res.status(statusCode).json({
        success: false,
        message,
        ...(env_1.env.NODE_ENV !== 'production' ? { stack: error.stack } : {})
    });
};
exports.errorHandler = errorHandler;
