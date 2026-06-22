"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDatabase = exports.connectDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
const logger_1 = require("./logger");
const connectDatabase = async () => {
    mongoose_1.default.set('strictQuery', true);
    await mongoose_1.default.connect(env_1.env.MONGODB_URI);
    logger_1.logger.info('MongoDB connected');
};
exports.connectDatabase = connectDatabase;
const disconnectDatabase = async () => {
    await mongoose_1.default.disconnect();
};
exports.disconnectDatabase = disconnectDatabase;
