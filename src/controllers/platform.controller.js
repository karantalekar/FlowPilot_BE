"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.platformController = void 0;
const { asyncHandler } = require("../utils/async-handler");
const { sendSuccess } = require("../utils/api-response");
const { platformService } = require("../services/platform.service");
const context = req => ({ ip: req.ip, userAgent: req.get('user-agent'), requestId: req.get('x-request-id') });
const handler = (fn, message) => asyncHandler(async (req, res) => sendSuccess(res, await fn(req), message));
exports.platformController = {
    register: handler(req => platformService.register(req.body, req.get('x-platform-setup-key'), context(req)), 'Platform owner registered'),
    login: handler(req => platformService.login(req.body.email, req.body.password, context(req)), 'Platform login successful'),
    refresh: handler(req => platformService.refresh(req.body.refreshToken), 'Platform token refreshed'),
    me: handler(req => platformService.safeAdmin(req.platformAdmin)),
    logout: handler(async req => { await platformService.logout(req.platformAdmin, context(req)); return null; }, 'Platform logout successful'),
    overview: handler(() => platformService.overview()),
    organizations: handler(req => platformService.organizations(req.query)),
    organization: handler(req => platformService.organization(req.params.id)),
    organizationStatus: handler(req => platformService.setOrganizationStatus(req.params.id, req.body, req.platformAdmin, context(req)), 'Organization status updated'),
    deleteOrganization: handler(async req => { await platformService.deleteOrganization(req.params.id, req.platformAdmin, context(req)); return null; }, 'Organization deleted'),
    users: handler(req => platformService.users(req.query)),
    plans: handler(req => platformService.plans(req.query)),
    createPlan: handler(req => platformService.createPlan(req.body, req.platformAdmin, context(req)), 'Plan created'),
    updatePlan: handler(req => platformService.updatePlan(req.params.id, req.body, req.platformAdmin, context(req)), 'Plan updated'),
    deletePlan: handler(async req => { await platformService.deletePlan(req.params.id, req.platformAdmin, context(req)); return null; }, 'Plan deleted'),
    subscriptions: handler(req => platformService.subscriptions(req.query)),
    subscriptionAction: handler(req => platformService.subscriptionAction(req.params.id, req.body, req.platformAdmin, context(req)), 'Subscription updated'),
    payments: handler(req => platformService.payments(req.query)),
    paymentDecision: handler(req => platformService.decidePayment(req.params.id, req.body, req.platformAdmin, context(req)), 'Payment reviewed'),
    invoices: handler(req => platformService.invoices(req.query)),
    invoiceStatus: handler(req => platformService.invoiceStatus(req.params.id, req.body.status, req.platformAdmin, context(req)), 'Invoice updated'),
    activities: handler(req => platformService.activities(req.query)),
    reports: handler(() => platformService.reports()),
    settings: handler(() => platformService.settings()),
    setSetting: handler(req => platformService.setSetting(req.body, req.platformAdmin, context(req)), 'Setting updated')
};
