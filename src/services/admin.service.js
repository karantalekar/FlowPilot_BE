"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminService = void 0;
const activity_log_model_1 = require("../models/activity-log.model");
const organization_model_1 = require("../models/organization.model");
const billing_model_1 = require("../models/billing.model");
const user_model_1 = require("../models/user.model");
const pagination_1 = require("../utils/pagination");
exports.adminService = {
    users(query) {
        return (0, pagination_1.paginate)(user_model_1.User, {}, query);
    },
    organizations(query) {
        return (0, pagination_1.paginate)(organization_model_1.Organization, {}, query);
    },
    subscriptions(query) {
        return (0, pagination_1.paginate)(billing_model_1.PaymentHistory, {}, query);
    },
    auditLogs(query) {
        return (0, pagination_1.paginate)(activity_log_model_1.ActivityLog, {}, query);
    },
    async stats() {
        const [users, organizations, revenue] = await Promise.all([
            user_model_1.User.countDocuments(),
            organization_model_1.Organization.countDocuments(),
            billing_model_1.PaymentHistory.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }])
        ]);
        return { users, organizations, revenue: revenue[0]?.total || 0 };
    }
};
