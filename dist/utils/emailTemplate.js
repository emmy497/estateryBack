"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.badge = exports.divider = exports.detailsBox = exports.emailTemplate = void 0;
const LOGO_URL = "https://res.cloudinary.com/df8sdofnq/image/upload/v1778233190/logo_xpf4mu.svg";
const emailTemplate = (body) => `
<div style="background-color:#f2f2f2;padding:40px 0;font-family:Arial,sans-serif;">
  <table align="center" width="100%" cellpadding="0" cellspacing="0"
    style="max-width:600px;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

    <!-- Header -->
    <tr>
      <td style="background:#F6F3FF;padding:28px 30px;text-align:center;border-bottom:1px solid #ede9ff;">
        <img src="${LOGO_URL}" alt="Estatery" width="130"
          style="display:block;margin:0 auto;" />
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding:36px 32px;color:#333333;font-size:15px;line-height:1.7;">
        ${body}
        <p style="margin-top:36px;margin-bottom:0;">
          Best regards,<br/>
          <strong style="color:#7065F0;">Estatery Team</strong>
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background:#F6F3FF;padding:16px 30px;text-align:center;border-top:1px solid #ede9ff;">
        <p style="margin:0;font-size:12px;color:#999999;">
          © ${new Date().getFullYear()} Estatery. All rights reserved.
        </p>
      </td>
    </tr>

  </table>
</div>
`;
exports.emailTemplate = emailTemplate;
const detailsBox = (rows) => `
<table width="100%" cellpadding="0" cellspacing="0"
  style="background:#f9fafb;border-radius:8px;padding:4px 16px;margin:20px 0;">
  ${rows
    .map((r) => `
  <tr>
    <td style="padding:8px 0;border-bottom:1px solid #eee;font-size:14px;">
      <span style="color:#888;min-width:90px;display:inline-block;">${r.label}</span>
      <strong style="color:#222;">${r.value}</strong>
    </td>
  </tr>`)
    .join("")}
</table>
`;
exports.detailsBox = detailsBox;
const divider = `<hr style="border:none;border-top:1px dashed #ddd;margin:24px 0;" />`;
exports.divider = divider;
const badge = (text, color, bg) => `<span style="display:inline-block;padding:4px 14px;border-radius:20px;background:${bg};color:${color};font-size:13px;font-weight:600;">${text}</span>`;
exports.badge = badge;
