"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const env_1 = require("../config/env");
exports.swaggerSpec = (0, swagger_jsdoc_1.default)({
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'FlowPilot API',
            version: '1.0.0',
            description: 'AI-powered SaaS/B2B business operations API'
        },
        servers: [{ url: `${env_1.env.API_BASE_URL}/api/v1` }],
        components: {
            securitySchemes: {
                bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
            }
        },
        security: [{ bearerAuth: [] }],
        paths: {
            '/auth/register': { post: { tags: ['Auth'], summary: 'Register user and workspace', responses: { 201: { description: 'Created' } } } },
            '/auth/login': { post: { tags: ['Auth'], summary: 'Login', responses: { 200: { description: 'OK' } } } },
            '/auth/refresh-token': { post: { tags: ['Auth'], summary: 'Refresh JWT tokens', responses: { 200: { description: 'OK' } } } },
            '/leads': { get: { tags: ['CRM'], summary: 'List leads', responses: { 200: { description: 'OK' } } }, post: { tags: ['CRM'], summary: 'Create lead', responses: { 201: { description: 'Created' } } } },
            '/customers': { get: { tags: ['CRM'], summary: 'List customers', responses: { 200: { description: 'OK' } } }, post: { tags: ['CRM'], summary: 'Create customer', responses: { 201: { description: 'Created' } } } },
            '/projects': { get: { tags: ['Projects'], summary: 'List projects', responses: { 200: { description: 'OK' } } }, post: { tags: ['Projects'], summary: 'Create project', responses: { 201: { description: 'Created' } } } },
            '/tasks': { get: { tags: ['Projects'], summary: 'List tasks', responses: { 200: { description: 'OK' } } }, post: { tags: ['Projects'], summary: 'Create task', responses: { 201: { description: 'Created' } } } },
            '/ai/chat': { post: { tags: ['AI'], summary: 'Chat with AI assistant', responses: { 200: { description: 'OK' } } } },
            '/ai/documents/upload': { post: { tags: ['AI'], summary: 'Upload document for RAG', responses: { 201: { description: 'Created' } } } },
            '/analytics/dashboard': { get: { tags: ['Analytics'], summary: 'Dashboard metrics', responses: { 200: { description: 'OK' } } } },
            '/billing/create-subscription': { post: { tags: ['Billing'], summary: 'Create Razorpay subscription', responses: { 200: { description: 'OK' } } } },
            '/billing/verify-payment': { post: { tags: ['Billing'], summary: 'Verify Razorpay payment', responses: { 200: { description: 'OK' } } } },
            '/notifications': { get: { tags: ['Notifications'], summary: 'List notifications', responses: { 200: { description: 'OK' } } } }
        }
    },
    apis: []
});
