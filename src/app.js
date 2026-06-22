"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const passport_1 = __importDefault(require("passport"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const billing_controller_1 = require("./controllers/billing.controller");
const passport_2 = require("./config/passport");
const env_1 = require("./config/env");
const logger_1 = require("./config/logger");
const swagger_1 = require("./docs/swagger");
const error_middleware_1 = require("./middlewares/error.middleware");
const rate_limit_middleware_1 = require("./middlewares/rate-limit.middleware");
const routes_1 = require("./routes");
(0, passport_2.configurePassport)();
exports.app = (0, express_1.default)();
exports.app.set('trust proxy', 1);
exports.app.use((0, helmet_1.default)());
exports.app.use((0, cors_1.default)({
    origin: env_1.env.CLIENT_URL,
    credentials: true
}));
exports.app.use((0, compression_1.default)());
exports.app.use((0, cookie_parser_1.default)(env_1.env.COOKIE_SECRET));
exports.app.use(passport_1.default.initialize());
exports.app.use((0, morgan_1.default)(env_1.env.NODE_ENV === 'production' ? 'combined' : 'dev', { stream: { write: (msg) => logger_1.logger.info(msg.trim()) } }));
exports.app.post('/api/v1/billing/webhook', express_1.default.raw({ type: 'application/json' }), billing_controller_1.billingController.webhook);
exports.app.use(express_1.default.json({ limit: '2mb' }));
exports.app.use(express_1.default.urlencoded({ extended: true }));
exports.app.use((0, express_mongo_sanitize_1.default)());
exports.app.use(rate_limit_middleware_1.apiLimiter);
exports.app.get('/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));
exports.app.use('/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
exports.app.use('/api/v1', routes_1.apiRouter);
exports.app.use(error_middleware_1.notFoundHandler);
exports.app.use(error_middleware_1.errorHandler);
