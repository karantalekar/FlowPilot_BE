"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const project_service_1 = require("../services/project.service");
const async_handler_1 = require("../utils/async-handler");
const api_response_1 = require("../utils/api-response");
exports.projectController = {
    createProject: (0, async_handler_1.asyncHandler)(async (req, res) => {
        const project = await project_service_1.projectService.createProject(req.tenantId, req.auth.userId, req.body);
        (0, api_response_1.sendSuccess)(res, project, 'Project created', http_status_1.default.CREATED);
    }),
    listProjects: (0, async_handler_1.asyncHandler)(async (req, res) => {
        const result = await project_service_1.projectService.listProjects(req.tenantId, req.auth.userId, req.auth.role, req.query);
        (0, api_response_1.sendSuccess)(res, result.items, 'Projects fetched', 200, { pagination: result.pagination });
    }),
    getProject: (0, async_handler_1.asyncHandler)(async (req, res) => {
        (0, api_response_1.sendSuccess)(res, await project_service_1.projectService.getProject(req.tenantId, req.params.id, req.auth.userId, req.auth.role));
    }),
    updateProject: (0, async_handler_1.asyncHandler)(async (req, res) => {
        (0, api_response_1.sendSuccess)(res, await project_service_1.projectService.updateProject(req.tenantId, req.params.id, req.body), 'Project updated');
    }),
    deleteProject: (0, async_handler_1.asyncHandler)(async (req, res) => {
        await project_service_1.projectService.deleteProject(req.tenantId, req.params.id);
        (0, api_response_1.sendSuccess)(res, null, 'Project deleted');
    }),
    createTask: (0, async_handler_1.asyncHandler)(async (req, res) => {
        const task = await project_service_1.projectService.createTask(req.tenantId, req.auth.userId, req.auth.role, req.body);
        (0, api_response_1.sendSuccess)(res, task, 'Task created', http_status_1.default.CREATED);
    }),
    listTasks: (0, async_handler_1.asyncHandler)(async (req, res) => {
        const result = await project_service_1.projectService.listTasks(req.tenantId, req.auth.userId, req.auth.role, req.query);
        (0, api_response_1.sendSuccess)(res, result.items, 'Tasks fetched', 200, { pagination: result.pagination });
    }),
    updateTask: (0, async_handler_1.asyncHandler)(async (req, res) => {
        (0, api_response_1.sendSuccess)(res, await project_service_1.projectService.updateTask(req.tenantId, req.params.id, req.auth.userId, req.auth.role, req.body), 'Task updated');
    }),
    kanban: (0, async_handler_1.asyncHandler)(async (req, res) => {
        (0, api_response_1.sendSuccess)(res, await project_service_1.projectService.kanban(req.tenantId, req.params.id, req.auth.userId, req.auth.role));
    }),
    assignments: (0, async_handler_1.asyncHandler)(async (req, res) => {
        (0, api_response_1.sendSuccess)(res, await project_service_1.projectService.assignments(req.tenantId, req.params.id));
    }),
    inviteMember: (0, async_handler_1.asyncHandler)(async (req, res) => {
        (0, api_response_1.sendSuccess)(res, await project_service_1.projectService.inviteMember(req.tenantId, req.params.id, req.auth.userId, req.auth.role, req.body.userId), 'Project invitation sent', http_status_1.default.CREATED);
    }),
    respondInvitation: (0, async_handler_1.asyncHandler)(async (req, res) => {
        (0, api_response_1.sendSuccess)(res, await project_service_1.projectService.respondInvitation(req.tenantId, req.params.id, req.params.invitationId, req.auth.userId, req.body.status), 'Project invitation updated');
    }),
    revokeMember: (0, async_handler_1.asyncHandler)(async (req, res) => {
        await project_service_1.projectService.revokeMember(req.tenantId, req.params.id, req.auth.role, req.params.userId);
        (0, api_response_1.sendSuccess)(res, null, 'Project access removed');
    })
};
