const { buildInvitationEmail } = require('../services/email-template.service');

describe('invitation email template', () => {
    it('includes the logo, workspace, role, action, and expiry', () => {
        const email = buildInvitationEmail({
            appName: 'Workspace App',
            clientUrl: 'https://app.example.com/',
            recipientName: 'Alex Admin',
            role: 'manager',
            workspaceName: 'Operations',
            inviteUrl: 'https://app.example.com/auth/accept-invite?token=safe-token'
        });
        expect(email.subject).toBe("You're invited to join Operations");
        expect(email.html).toContain('https://app.example.com/favicon.png');
        expect(email.html).toContain('Alex Admin');
        expect(email.html).toContain('Manager');
        expect(email.html).toContain('Accept invitation');
        expect(email.html).toContain('expires in 7 days');
    });

    it('escapes user-controlled content', () => {
        const email = buildInvitationEmail({
            appName: 'Workspace App',
            clientUrl: 'https://app.example.com',
            recipientName: '<script>alert(1)</script>',
            role: 'employee',
            workspaceName: '<b>Unsafe</b>',
            inviteUrl: 'https://app.example.com/invite'
        });
        expect(email.html).not.toContain('<script>');
        expect(email.html).not.toContain('<b>Unsafe</b>');
        expect(email.html).toContain('&lt;script&gt;');
    });
});
