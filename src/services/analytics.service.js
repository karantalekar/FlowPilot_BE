"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsService = void 0;
const customer_model_1 = require("../models/customer.model");
const lead_model_1 = require("../models/lead.model");
const billing_model_1 = require("../models/billing.model");
const project_model_1 = require("../models/project.model");
const task_model_1 = require("../models/task.model");
const user_model_1 = require("../models/user.model");
const mongoose_1 = require("mongoose");
const monthlyCounts = (model, match) => model.aggregate([
    { $match: match },
    { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
]);
exports.analyticsService = {
    async dashboard(organizationId, userId, role) {
        const organizationObjectId = new mongoose_1.Types.ObjectId(organizationId);
        const projectFilter = { organization: organizationId, ...(role === 'employee' ? { members: userId } : {}) };
        const accessibleProjectIds = role === 'employee' ? await project_model_1.Project.find(projectFilter).distinct('_id') : null;
        const taskFilter = { organization: organizationId, ...(accessibleProjectIds ? { project: { $in: accessibleProjectIds } } : {}) };
        const [revenueAgg, leads, wonLeads, customers, users, projects, completedProjects, tasks, doneTasks] = await Promise.all([
            billing_model_1.PaymentHistory.aggregate([
                { $match: { organization: organizationObjectId, status: 'paid' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            lead_model_1.Lead.countDocuments({ organization: organizationId }),
            lead_model_1.Lead.countDocuments({ organization: organizationId, status: 'won' }),
            customer_model_1.Customer.countDocuments({ organization: organizationId }),
            user_model_1.User.countDocuments({ organization: organizationId }),
            project_model_1.Project.countDocuments(projectFilter),
            project_model_1.Project.countDocuments({ ...projectFilter, status: 'completed' }),
            task_model_1.Task.countDocuments(taskFilter),
            task_model_1.Task.countDocuments({ ...taskFilter, status: 'done' })
        ]);
        return {
            revenue: revenueAgg[0]?.total || 0,
            leadConversionRate: leads ? Math.round((wonLeads / leads) * 100) : 0,
            customers,
            users,
            projectCompletionRate: projects ? Math.round((completedProjects / projects) * 100) : 0,
            teamProductivity: tasks ? Math.round((doneTasks / tasks) * 100) : 0
        };
    },
    async crm(organizationId) {
        const organization = new mongoose_1.Types.ObjectId(organizationId);
        const since = new Date();
        since.setMonth(since.getMonth() - 5, 1);
        since.setHours(0, 0, 0, 0);
        const [byStatus, leadsByMonth, customersByMonth] = await Promise.all([
            lead_model_1.Lead.aggregate([{ $match: { organization } }, { $group: { _id: '$status', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
            monthlyCounts(lead_model_1.Lead, { organization, createdAt: { $gte: since } }),
            monthlyCounts(customer_model_1.Customer, { organization, createdAt: { $gte: since } })
        ]);
        return { byStatus, leadsByMonth, customersByMonth };
    },
    async projects(organizationId, userId, role) {
        const organizationObjectId = new mongoose_1.Types.ObjectId(organizationId);
        const projectFilter = { organization: organizationId, ...(role === 'employee' ? { members: userId } : {}) };
        const projectIds = role === 'employee' ? await project_model_1.Project.find(projectFilter).distinct('_id') : null;
        const aggregateProjectFilter = { organization: organizationObjectId, ...(role === 'employee' ? { members: new mongoose_1.Types.ObjectId(userId) } : {}) };
        const aggregateTaskFilter = { organization: organizationObjectId, ...(projectIds ? { project: { $in: projectIds } } : {}) };
        const since = new Date();
        since.setMonth(since.getMonth() - 5, 1);
        since.setHours(0, 0, 0, 0);
        const [byStatus, tasksByStatus, projectsByMonth, tasksByMonth] = await Promise.all([
            project_model_1.Project.aggregate([{ $match: aggregateProjectFilter }, { $group: { _id: '$status', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
            task_model_1.Task.aggregate([{ $match: aggregateTaskFilter }, { $group: { _id: '$status', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
            monthlyCounts(project_model_1.Project, { ...aggregateProjectFilter, createdAt: { $gte: since } }),
            monthlyCounts(task_model_1.Task, { ...aggregateTaskFilter, createdAt: { $gte: since } })
        ]);
        return { byStatus, tasksByStatus, projectsByMonth, tasksByMonth };
    }
};
