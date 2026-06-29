"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildInvitationEmail = void 0;
const path = require("path");

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const buildInvitationEmail = ({
  appName,
  recipientName,
  role,
  workspaceName,
  inviteUrl,
}) => {
  const safeAppName = escapeHtml(appName);
  const safeName = escapeHtml(recipientName);
  const safeRole = escapeHtml(role.charAt(0).toUpperCase() + role.slice(1));
  const safeWorkspace = escapeHtml(workspaceName);
  const safeInviteUrl = escapeHtml(inviteUrl);
  const logoCid = "flowpilot-logo";
  const logoPath = path.resolve(__dirname, "../../../public/favicon.png");
  return {
    subject: `You're invited to join ${String(workspaceName).replace(/[\r\n]/g, " ")}`,
    html: `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Workspace invitation</title></head>
<body style="margin:0;padding:0;background:#f6f5fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Join ${safeWorkspace} and start collaborating with your team.</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f5fb;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #e7e5e4;border-radius:20px;overflow:hidden;box-shadow:0 12px 32px rgba(76,29,149,.08);">
        <tr><td style="height:8px;background:linear-gradient(90deg,#8b5cf6,#ec4899,#fb923c);"></td></tr>
        <tr><td align="center" style="padding:34px 40px 16px;">
          <img src="cid:${logoCid}" width="96" height="80" alt="${safeAppName} logo" style="display:block;width:96px;height:80px;object-fit:contain;border:0;outline:none;text-decoration:none;">
          <div style="margin-top:10px;font-size:22px;font-weight:700;color:#1a1a1a;">${safeAppName}</div>
        </td></tr>
        <tr><td style="padding:12px 40px 36px;">
          <h1 style="margin:0 0 16px;text-align:center;font-size:28px;line-height:1.25;color:#111827;">You’re invited to collaborate</h1>
          <p style="margin:0 0 20px;text-align:center;font-size:16px;line-height:1.65;color:#6b7280;">Hello ${safeName}, you’ve been invited to join <strong style="color:#374151;">${safeWorkspace}</strong>.</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:24px 0;background:#faf9ff;border:1px solid #ede9fe;border-radius:12px;">
            <tr><td style="padding:16px 18px;font-size:14px;color:#6b7280;">Assigned role</td><td align="right" style="padding:16px 18px;font-size:14px;font-weight:700;color:#6d28d9;">${safeRole}</td></tr>
          </table>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:6px 0 24px;">
            <a href="${safeInviteUrl}" style="display:inline-block;background:#6d28d9;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:14px 26px;border-radius:10px;">Accept invitation</a>
          </td></tr></table>
          <p style="margin:0 0 8px;text-align:center;font-size:13px;line-height:1.6;color:#9ca3af;">This secure invitation expires in 7 days.</p>
          <p style="margin:0;text-align:center;font-size:13px;line-height:1.6;color:#9ca3af;">If you weren’t expecting this invitation, you can safely ignore this email.</p>
        </td></tr>
        <tr><td style="padding:22px 32px;background:#fafafa;border-top:1px solid #eeeeee;text-align:center;font-size:12px;line-height:1.6;color:#9ca3af;">Sent by ${safeAppName}. Please do not forward this email because the invitation link is unique to you.</td></tr>
      </table>
      <p style="margin:20px 0 0;font-size:12px;color:#9ca3af;">Button not working? Copy this link into your browser:<br><a href="${safeInviteUrl}" style="color:#7c3aed;word-break:break-all;">${safeInviteUrl}</a></p>
    </td></tr>
  </table>
</body>
</html>`,
    attachments: [{ filename: "flowpilot-logo.png", path: logoPath, cid: logoCid }],
  };
};
exports.buildInvitationEmail = buildInvitationEmail;
