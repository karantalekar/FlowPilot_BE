"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = require("./app");
const database_1 = require("./config/database");
const env_1 = require("./config/env");
const logger_1 = require("./config/logger");
const redis_1 = require("./config/redis");
const reminder_job_1 = require("./jobs/reminder.job");
const sockets_1 = require("./sockets");
const server = http_1.default.createServer(app_1.app);
const start = async () => {
    await (0, database_1.connectDatabase)();
    (0, sockets_1.initializeSocket)(server);
    (0, reminder_job_1.startReminderJob)();
    server.listen(env_1.env.PORT, () => logger_1.logger.info(`${env_1.env.APP_NAME} API listening on ${env_1.env.PORT}`));
};
const shutdown = async (signal) => {
    logger_1.logger.info(`${signal} received, shutting down`);
    server.close(async () => {
        await redis_1.redis?.quit();
        await (0, database_1.disconnectDatabase)();
        process.exit(0);
    });
};
process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
start().catch((error) => {
    logger_1.logger.error('Failed to start server', { error });
    process.exit(1);
});
