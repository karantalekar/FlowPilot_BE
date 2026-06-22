"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("./env");
const logger_1 = require("./logger");
exports.redis = process.env.REDIS_ENABLED === 'false' ? null : new ioredis_1.default(env_1.env.REDIS_URL, {
    maxRetriesPerRequest: 2,
    enableReadyCheck: true
});
exports.redis?.on('connect', () => logger_1.logger.info('Redis connected'));
exports.redis?.on('error', (error) => logger_1.logger.warn(`Redis error: ${error.message}`));
