"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startReminderJob = void 0;
const logger_1 = require("../config/logger");
const lead_model_1 = require("../models/lead.model");
const notification_service_1 = require("../services/notification.service");
const startReminderJob = () => {
    return setInterval(async () => {
        try {
            const dueLeads = await lead_model_1.Lead.find({ followUpAt: { $lte: new Date() }, owner: { $exists: true } }).limit(50);
            await Promise.all(dueLeads.map((lead) => notification_service_1.notificationService.create({
                organization: lead.organization.toString(),
                user: lead.owner.toString(),
                title: 'Lead follow-up due',
                message: `Follow up with ${lead.name}`,
                type: 'warning',
                metadata: { leadId: lead._id }
            })));
        }
        catch (error) {
            logger_1.logger.error('Reminder job failed', { error });
        }
    }, 10 * 60 * 1000);
};
exports.startReminderJob = startReminderJob;
