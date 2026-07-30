"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceService = exports.buildInvoiceEmail = void 0;
const { Invoice } = require("../models/platform.model");
const { Organization } = require("../models/organization.model");
const { User } = require("../models/user.model");
const { emailService } = require("./email.service");

const escapeHtml = value => String(value ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
const money = (amount, currency) => new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);

const buildInvoiceEmail = ({ invoice, organization, payment }) => {
    const amount = money(invoice.total, invoice.currency);
    const paidAt = new Date(invoice.paidAt).toLocaleDateString('en-IN', { dateStyle: 'long' });
    const plan = payment.plan ? `${payment.plan[0].toUpperCase()}${payment.plan.slice(1)} plan` : 'FlowPilot subscription';
    const document = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(invoice.number)}</title></head>
<body style="font-family:Arial,sans-serif;color:#172033;max-width:760px;margin:40px auto">
<h1 style="margin-bottom:4px">Invoice</h1><p style="margin-top:0;color:#667085">${escapeHtml(invoice.number)}</p>
<p><strong>Bill to:</strong><br>${escapeHtml(organization.name)}</p>
<table style="width:100%;border-collapse:collapse;margin:28px 0"><thead><tr><th style="text-align:left;border-bottom:1px solid #ddd;padding:10px">Description</th><th style="text-align:right;border-bottom:1px solid #ddd;padding:10px">Amount</th></tr></thead>
<tbody><tr><td style="padding:10px">${escapeHtml(plan)}</td><td style="text-align:right;padding:10px">${escapeHtml(amount)}</td></tr></tbody>
<tfoot><tr><th style="text-align:right;border-top:1px solid #ddd;padding:10px">Total paid</th><th style="text-align:right;border-top:1px solid #ddd;padding:10px">${escapeHtml(amount)}</th></tr></tfoot></table>
<p><strong>Payment date:</strong> ${escapeHtml(paidAt)}<br><strong>Payment method:</strong> ${escapeHtml(payment.method || 'UPI')}<br><strong>Transaction ID:</strong> ${escapeHtml(payment.transactionId)}</p>
<p style="margin-top:36px;color:#667085;font-size:13px">Thank you for using FlowPilot.</p></body></html>`;
    return {
        subject: `Payment receipt ${invoice.number} — FlowPilot`,
        html: `<p>Hello,</p><p>Your payment of <strong>${escapeHtml(amount)}</strong> for ${escapeHtml(organization.name)} has been verified successfully.</p><p>Your paid invoice <strong>${escapeHtml(invoice.number)}</strong> is attached.</p><p>Thank you for using FlowPilot.</p>`,
        attachment: { filename: `${invoice.number}.html`, content: Buffer.from(document), contentType: 'text/html; charset=utf-8' }
    };
};
exports.buildInvoiceEmail = buildInvoiceEmail;

exports.invoiceService = {
    async createAndSendForPayment(payment) {
        const organization = await Organization.findById(payment.organization).lean();
        if (!organization) throw new Error('Cannot generate invoice: organization not found');
        const number = `FP-${new Date(payment.verifiedAt).getFullYear()}-${String(payment._id).slice(-8).toUpperCase()}`;
        const description = payment.plan ? `${payment.plan[0].toUpperCase()}${payment.plan.slice(1)} plan` : 'FlowPilot subscription';
        const invoice = await Invoice.findOneAndUpdate({ payment: payment._id }, {
            $setOnInsert: {
                number, organization: payment.organization, subscription: payment.subscription, payment: payment._id,
                status: 'paid', currency: payment.currency || 'INR', subtotal: payment.amount, tax: 0, total: payment.amount,
                dueAt: payment.verifiedAt, paidAt: payment.verifiedAt,
                lineItems: [{ description, quantity: 1, unitPrice: payment.amount, amount: payment.amount }]
            }
        }, { upsert: true, new: true, setDefaultsOnInsert: true });
        const admins = await User.find({ organization: payment.organization, role: 'admin' }).select('email').lean();
        const recipients = [...new Set(admins.map(user => user.email).filter(Boolean))];
        if (!recipients.length) {
            const payer = await User.findById(payment.payer).select('email').lean();
            if (payer?.email) recipients.push(payer.email);
        }
        if (!invoice.sentAt && recipients.length) {
            const message = buildInvoiceEmail({ invoice, organization, payment });
            const sent = await emailService.send(recipients, message.subject, message.html, [message.attachment]);
            if (sent) await Invoice.updateOne({ _id: invoice._id }, { sentAt: new Date(), recipients });
        }
        return invoice;
    }
};
