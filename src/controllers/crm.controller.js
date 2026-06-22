"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.crmController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const crm_service_1 = require("../services/crm.service");
const async_handler_1 = require("../utils/async-handler");
const api_response_1 = require("../utils/api-response");
exports.crmController = {
    createLead: (0, async_handler_1.asyncHandler)(async (req, res) => {
        const lead = await crm_service_1.crmService.createLead(req.tenantId, req.body);
        (0, api_response_1.sendSuccess)(res, lead, 'Lead created', http_status_1.default.CREATED);
    }),
    listLeads: (0, async_handler_1.asyncHandler)(async (req, res) => {
        const result = await crm_service_1.crmService.listLeads(req.tenantId, req.query);
        (0, api_response_1.sendSuccess)(res, result.items, 'Leads fetched', 200, { pagination: result.pagination });
    }),
    getLead: (0, async_handler_1.asyncHandler)(async (req, res) => {
        (0, api_response_1.sendSuccess)(res, await crm_service_1.crmService.getLead(req.tenantId, req.params.id));
    }),
    updateLead: (0, async_handler_1.asyncHandler)(async (req, res) => {
        (0, api_response_1.sendSuccess)(res, await crm_service_1.crmService.updateLead(req.tenantId, req.params.id, req.body), 'Lead updated');
    }),
    deleteLead: (0, async_handler_1.asyncHandler)(async (req, res) => {
        await crm_service_1.crmService.deleteLead(req.tenantId, req.params.id);
        (0, api_response_1.sendSuccess)(res, null, 'Lead deleted');
    }),
    createCustomer: (0, async_handler_1.asyncHandler)(async (req, res) => {
        const customer = await crm_service_1.crmService.createCustomer(req.tenantId, req.body);
        (0, api_response_1.sendSuccess)(res, customer, 'Customer created', http_status_1.default.CREATED);
    }),
    listCustomers: (0, async_handler_1.asyncHandler)(async (req, res) => {
        const result = await crm_service_1.crmService.listCustomers(req.tenantId, req.query);
        (0, api_response_1.sendSuccess)(res, result.items, 'Customers fetched', 200, { pagination: result.pagination });
    }),
    updateCustomer: (0, async_handler_1.asyncHandler)(async (req, res) => {
        (0, api_response_1.sendSuccess)(res, await crm_service_1.crmService.updateCustomer(req.tenantId, req.params.id, req.body), 'Customer updated');
    }),
    deleteCustomer: (0, async_handler_1.asyncHandler)(async (req, res) => {
        await crm_service_1.crmService.deleteCustomer(req.tenantId, req.params.id);
        (0, api_response_1.sendSuccess)(res, null, 'Customer deleted');
    })
};
