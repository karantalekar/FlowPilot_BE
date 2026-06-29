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
const allowedOrigins = new Set([
    env_1.env.CLIENT_URL,
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
]);
const isLocalDevOrigin = (origin) => env_1.env.NODE_ENV !== 'production' &&
    /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(origin);
exports.app.use((0, cors_1.default)({
    origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin) || isLocalDevOrigin(origin))
            return callback(null, true);
        return callback(null, false);
    },
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
exports.app.get('/', (_req, res) => res.json({ message: `${env_1.env.APP_NAME} backend is running` }));
exports.app.get('/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));
exports.app.use('/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
exports.app.use('/api/v1', routes_1.apiRouter);
exports.app.use(error_middleware_1.notFoundHandler);
exports.app.use(error_middleware_1.errorHandler);
