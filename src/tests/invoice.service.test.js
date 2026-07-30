const { buildInvoiceEmail } = require('../services/invoice.service');

describe('invoice email', () => {
    it('builds an attached paid invoice and escapes stored values', () => {
        const message = buildInvoiceEmail({
            invoice: { number: 'FP-2026-ABC123', total: 2999, currency: 'INR', paidAt: new Date('2026-07-29T00:00:00Z') },
            organization: { name: '<script>Unsafe Org</script>' },
            payment: { plan: 'pro', method: 'UPI', transactionId: 'UTR123456' }
        });
        expect(message.subject).toContain('FP-2026-ABC123');
        expect(message.html).not.toContain('<script>');
        expect(message.attachment.filename).toBe('FP-2026-ABC123.html');
        const invoice = message.attachment.content.toString();
        expect(invoice).toContain('Total paid');
        expect(invoice).toContain('UTR123456');
        expect(invoice).toContain('&lt;script&gt;Unsafe Org&lt;/script&gt;');
        expect(invoice).not.toContain('<script>Unsafe Org</script>');
    });
});
