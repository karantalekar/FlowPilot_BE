"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireActiveOrganizationRoute = exports.requireActiveSubscription = exports.getTrialStatus = void 0;
const http_status_1 = require("http-status");
const organization_model_1 = require("../models/organization.model");
const api_error_1 = require("../utils/api-error");
const async_handler_1 = require("../utils/async-handler");

const TRIAL_LENGTH_MS = 7 * 24 * 60 * 60 * 1000;

const getTrialStatus = (organization, now = new Date()) => {
    const trialEndsAt = organization.trialEndsAt || new Date(new Date(organization.createdAt).getTime() + TRIAL_LENGTH_MS);
    const millisecondsRemaining = Math.max(0, trialEndsAt.getTime() - now.getTime());
    return {
        trialEndsAt,
        trialExpired: organization.plan === 'free' && millisecondsRemaining === 0,
        trialDaysRemaining: organization.plan === 'free' ? Math.ceil(millisecondsRemaining / (24 * 60 * 60 * 1000)) : null
    };
};
exports.getTrialStatus = getTrialStatus;

exports.requireActiveSubscription = (0, async_handler_1.asyncHandler)(async (req, _res, next) => {
    const organization = await organization_model_1.Organization.findById(req.tenantId).select('plan trialEndsAt createdAt');
    if (!organization)
        throw new api_error_1.ApiError(http_status_1.NOT_FOUND, 'Organization not found');
    const trial = (0, exports.getTrialStatus)(organization);
    if (trial.trialExpired)
        throw new api_error_1.ApiError(402, 'Your 7-day free trial has ended. Upgrade your workspace to continue using FlowPilot.');
    next();
});

const tenant_middleware_1 = require("./tenant.middleware");
const requireActiveOrganizationRoute = (req, res, next) => {
    if (req.method === 'POST' && req.path === '/')
        return next();
    return (0, tenant_middleware_1.requireTenant)(req, res, () => (0, exports.requireActiveSubscription)(req, res, next));
};
exports.requireActiveOrganizationRoute = requireActiveOrganizationRoute;
