"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) { return (mod && mod.__esModule) ? mod : { "default": mod }; };
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const organization_service_1 = require("../services/organization.service");
const async_handler_1 = require("../utils/async-handler");
const api_response_1 = require("../utils/api-response");
exports.organizationController = {
    create: (0, async_handler_1.asyncHandler)(async (req, res) => {
        const org = await organization_service_1.organizationService.create(req.auth.userId, req.body.name);
        (0, api_response_1.sendSuccess)(res, org, 'Organization created', http_status_1.default.CREATED);
    }),
    current: (0, async_handler_1.asyncHandler)(async (req, res) => {
        (0, api_response_1.sendSuccess)(res, await organization_service_1.organizationService.current(req.tenantId));
    }),
    members: (0, async_handler_1.asyncHandler)(async (req, res) => {
        (0, api_response_1.sendSuccess)(res, await organization_service_1.organizationService.members(req.tenantId));
    }),
    inviteMember: (0, async_handler_1.asyncHandler)(async (req, res) => {
        const user = await organization_service_1.organizationService.inviteMember(req.tenantId, req.auth.role, req.body);
        (0, api_response_1.sendSuccess)(res, user, 'Member invited', http_status_1.default.CREATED);
    }),
    updateMember: (0, async_handler_1.asyncHandler)(async (req, res) => {
        const member = await organization_service_1.organizationService.updateMember(req.tenantId, req.params.memberId, req.body);
        (0, api_response_1.sendSuccess)(res, member, 'Member updated');
    }),
    removeMember: (0, async_handler_1.asyncHandler)(async (req, res) => {
        await organization_service_1.organizationService.removeMember(req.tenantId, req.auth.userId, req.params.memberId);
        (0, api_response_1.sendSuccess)(res, null, 'Member removed');
    }),
    update: (0, async_handler_1.asyncHandler)(async (req, res) => {
        const org = await organization_service_1.organizationService.update(req.params.id, req.tenantId, req.body);
        (0, api_response_1.sendSuccess)(res, org, 'Organization updated');
    })
};
