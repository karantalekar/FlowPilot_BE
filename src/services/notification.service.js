"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
const notification_model_1 = require("../models/notification.model");
const sockets_1 = require("../sockets");
const pagination_1 = require("../utils/pagination");
exports.notificationService = {
    async create(input) {
        const notification = await notification_model_1.Notification.create(input);
        (0, sockets_1.emitToUser)(input.user, 'notification:new', notification);
        return notification;
    },
    list(organizationId, userId, query) {
        return (0, pagination_1.paginate)(notification_model_1.Notification, { organization: organizationId, user: userId }, query);
    },
    markRead(organizationId, userId, id) {
        return notification_model_1.Notification.findOneAndUpdate({ _id: id, organization: organizationId, user: userId }, { readAt: new Date() }, { new: true });
    },
    markAllRead(organizationId, userId) {
        return notification_model_1.Notification.updateMany({ organization: organizationId, user: userId, readAt: { $exists: false } }, { readAt: new Date() });
    }
};
