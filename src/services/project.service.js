"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const project_model_1 = require("../models/project.model");
const task_model_1 = require("../models/task.model");
const user_model_1 = require("../models/user.model");
const notification_model_1 = require("../models/notification.model");
const notification_service_1 = require("./notification.service");
const activity_log_model_1 = require("../models/activity-log.model");
const api_error_1 = require("../utils/api-error");
const pagination_1 = require("../utils/pagination");
const query_1 = require("../utils/query");
const accessFilter = (organizationId, userId, role) => ({ organization: organizationId, ...(role === 'employee' ? { members: userId } : {}) });
const requireProjectAccess = async (organizationId, projectId, userId, role) => {
    const project = await project_model_1.Project.findOne({ _id: projectId, ...accessFilter(organizationId, userId, role) });
    if (!project)
        throw new api_error_1.ApiError(http_status_1.default.NOT_FOUND, 'Project not found or access has not been granted');
    return project;
};
exports.projectService = {
    async createProject(organizationId, userId, data) {
        const project = await project_model_1.Project.create({ ...data, organization: organizationId, owner: userId });
        await activity_log_model_1.ActivityLog.create({ organization: organizationId, actor: userId, entity: 'project', entityId: project._id, action: 'created' });
        return project;
    },
    listProjects(organizationId, userId, role, query) {
        return (0, pagination_1.paginate)(project_model_1.Project, { ...accessFilter(organizationId, userId, role), ...(query.status ? { status: query.status } : {}), ...(0, query_1.buildRegexSearch)(query.search, ['name']) }, query);
    },
    getProject(organizationId, id, userId, role) {
        return requireProjectAccess(organizationId, id, userId, role);
    },
    async updateProject(organizationId, id, data) {
        const project = await project_model_1.Project.findOneAndUpdate({ _id: id, organization: organizationId }, data, { new: true });
        if (!project)
            throw new api_error_1.ApiError(http_status_1.default.NOT_FOUND, 'Project not found');
        return project;
    },
    async deleteProject(organizationId, id) {
        const project = await project_model_1.Project.findOneAndDelete({ _id: id, organization: organizationId });
        if (!project)
            throw new api_error_1.ApiError(http_status_1.default.NOT_FOUND, 'Project not found');
        await task_model_1.Task.deleteMany({ project: id, organization: organizationId });
    },
    async createTask(organizationId, userId, role, data) {
        await requireProjectAccess(organizationId, data.project, userId, role);
        const task = await task_model_1.Task.create({ ...data, organization: organizationId });
        await activity_log_model_1.ActivityLog.create({ organization: organizationId, actor: userId, entity: 'task', entityId: task._id, action: 'created' });
        return task;
    },
    async listTasks(organizationId, userId, role, query) {
        let projectFilter = query.project ? { project: query.project } : {};
        if (role === 'employee') {
            if (query.project)
                await requireProjectAccess(organizationId, query.project, userId, role);
            else {
                const projectIds = await project_model_1.Project.find(accessFilter(organizationId, userId, role)).distinct('_id');
                projectFilter = { project: { $in: projectIds } };
            }
        }
        return (0, pagination_1.paginate)(task_model_1.Task, { organization: organizationId, ...projectFilter, ...(query.status ? { status: query.status } : {}) }, query);
    },
    async updateTask(organizationId, id, userId, role, data) {
        const existing = await task_model_1.Task.findOne({ _id: id, organization: organizationId });
        if (!existing)
            throw new api_error_1.ApiError(http_status_1.default.NOT_FOUND, 'Task not found');
        await requireProjectAccess(organizationId, existing.project, userId, role);
        const comment = data.comment;
        delete data.comment;
        const update = { ...data };
        if (typeof comment === 'string') {
            update.$push = { comments: { author: userId, body: comment } };
        }
        const task = await task_model_1.Task.findOneAndUpdate({ _id: id, organization: organizationId }, update, { new: true });
        if (!task)
            throw new api_error_1.ApiError(http_status_1.default.NOT_FOUND, 'Task not found');
        return task;
    },
    async kanban(organizationId, projectId, userId, role) {
        await requireProjectAccess(organizationId, projectId, userId, role);
        const tasks = await task_model_1.Task.find({ organization: organizationId, project: projectId }).sort('createdAt');
        return tasks.reduce((board, task) => {
            board[task.status] = board[task.status] || [];
            board[task.status].push(task);
            return board;
        }, {});
    },
    async assignments(organizationId, projectId) {
        const project = await project_model_1.Project.findOne({ _id: projectId, organization: organizationId })
            .populate('members', 'name email role')
            .populate('invitations.user', 'name email role');
        if (!project)
            throw new api_error_1.ApiError(http_status_1.default.NOT_FOUND, 'Project not found');
        return { members: project.members, invitations: project.invitations };
    },
    async inviteMember(organizationId, projectId, invitedBy, inviterRole, userId) {
        const [project, user] = await Promise.all([
            project_model_1.Project.findOne({ _id: projectId, organization: organizationId }),
            user_model_1.User.findOne({ _id: userId, organization: organizationId })
        ]);
        if (!project)
            throw new api_error_1.ApiError(http_status_1.default.NOT_FOUND, 'Project not found');
        if (!user || !['employee', 'manager'].includes(user.role))
            throw new api_error_1.ApiError(http_status_1.default.BAD_REQUEST, 'Select an Employee or Manager from this workspace');
        if (inviterRole === 'manager' && user.role !== 'employee')
            throw new api_error_1.ApiError(http_status_1.default.FORBIDDEN, 'Managers can invite Employees only');
        if (project.members.some((member) => member.toString() === userId) || project.invitations.some((invite) => invite.user.toString() === userId && invite.status === 'pending'))
            throw new api_error_1.ApiError(http_status_1.default.CONFLICT, 'This member already has project access or a pending invitation');
        project.invitations.push({ user: userId, invitedBy, status: 'pending' });
        await project.save();
        const invitation = project.invitations[project.invitations.length - 1];
        await notification_service_1.notificationService.create({ organization: organizationId, user: userId, title: 'Project invitation', message: `You were invited to work on ${project.name}`, type: 'info', metadata: { kind: 'project_invitation', projectId: project._id.toString(), invitationId: invitation._id.toString(), status: 'pending' } });
        return invitation;
    },
    async respondInvitation(organizationId, projectId, invitationId, userId, status) {
        const project = await project_model_1.Project.findOne({ _id: projectId, organization: organizationId, 'invitations._id': invitationId });
        if (!project)
            throw new api_error_1.ApiError(http_status_1.default.NOT_FOUND, 'Project invitation not found');
        const invitation = project.invitations.id(invitationId);
        if (invitation.user.toString() !== userId || invitation.status !== 'pending')
            throw new api_error_1.ApiError(http_status_1.default.FORBIDDEN, 'This invitation cannot be changed');
        invitation.status = status;
        invitation.respondedAt = new Date();
        if (status === 'accepted' && !project.members.some((member) => member.toString() === userId))
            project.members.push(userId);
        await project.save();
        await notification_model_1.Notification.updateMany({ organization: organizationId, user: userId, 'metadata.invitationId': invitationId }, { $set: { 'metadata.status': status, readAt: new Date() } });
        return { projectId: project._id, status };
    },
    async revokeMember(organizationId, projectId, requesterRole, userId) {
        const [project, user] = await Promise.all([
            project_model_1.Project.findOne({ _id: projectId, organization: organizationId, members: userId }),
            user_model_1.User.findOne({ _id: userId, organization: organizationId })
        ]);
        if (!project || !user)
            throw new api_error_1.ApiError(http_status_1.default.NOT_FOUND, 'Assigned project member not found');
        if (requesterRole === 'manager' && user.role !== 'employee')
            throw new api_error_1.ApiError(http_status_1.default.FORBIDDEN, 'Managers can revoke Employee access only');
        project.members.pull(userId);
        await project.save();
        await notification_service_1.notificationService.create({ organization: organizationId, user: userId, title: 'Project access removed', message: `Your access to ${project.name} was removed`, type: 'warning', metadata: { kind: 'project_access_removed', projectId: project._id.toString() } });
    }
};
