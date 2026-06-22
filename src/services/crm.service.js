"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.crmService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const customer_model_1 = require("../models/customer.model");
const lead_model_1 = require("../models/lead.model");
const api_error_1 = require("../utils/api-error");
const pagination_1 = require("../utils/pagination");
const query_1 = require("../utils/query");
exports.crmService = {
    createLead(organizationId, data) {
        return lead_model_1.Lead.create({ ...data, organization: organizationId });
    },
    async listLeads(organizationId, query) {
        const filter = {
            organization: organizationId,
            ...(query.status ? { status: query.status } : {}),
            ...(query.owner ? { owner: query.owner } : {}),
            ...(0, query_1.buildRegexSearch)(query.search, ['name', 'email', 'company'])
        };
        return (0, pagination_1.paginate)(lead_model_1.Lead, filter, query);
    },
    async getLead(organizationId, id) {
        const lead = await lead_model_1.Lead.findOne({ _id: id, organization: organizationId });
        if (!lead)
            throw new api_error_1.ApiError(http_status_1.default.NOT_FOUND, 'Lead not found');
        return lead;
    },
    async updateLead(organizationId, id, data) {
        const lead = await lead_model_1.Lead.findOneAndUpdate({ _id: id, organization: organizationId }, data, { new: true });
        if (!lead)
            throw new api_error_1.ApiError(http_status_1.default.NOT_FOUND, 'Lead not found');
        return lead;
    },
    async deleteLead(organizationId, id) {
        const lead = await lead_model_1.Lead.findOneAndDelete({ _id: id, organization: organizationId });
        if (!lead)
            throw new api_error_1.ApiError(http_status_1.default.NOT_FOUND, 'Lead not found');
    },
    createCustomer(organizationId, data) {
        return customer_model_1.Customer.create({ ...data, organization: organizationId });
    },
    listCustomers(organizationId, query) {
        return (0, pagination_1.paginate)(customer_model_1.Customer, { organization: organizationId, ...(0, query_1.buildRegexSearch)(query.search, ['name', 'email', 'company']) }, query);
    },
    async updateCustomer(organizationId, id, data) {
        const customer = await customer_model_1.Customer.findOneAndUpdate({ _id: id, organization: organizationId }, data, { new: true, runValidators: true });
        if (!customer)
            throw new api_error_1.ApiError(http_status_1.default.NOT_FOUND, 'Customer not found');
        return customer;
    },
    async deleteCustomer(organizationId, id) {
        const customer = await customer_model_1.Customer.findOneAndDelete({ _id: id, organization: organizationId });
        if (!customer)
            throw new api_error_1.ApiError(http_status_1.default.NOT_FOUND, 'Customer not found');
    }
};
