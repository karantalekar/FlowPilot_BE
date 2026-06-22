"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = void 0;
const sendSuccess = (res, data, message = 'Success', statusCode = 200, meta) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        ...(meta ? { meta } : {})
    });
};
exports.sendSuccess = sendSuccess;
