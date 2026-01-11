// utils/emailTemplates.js
function passwordResetEmail (name, resetLink) {
  return `
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width">
    </head>
    <body style="font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background:#f6f7fb; margin:0;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td align="center" style="padding: 24px 12px;">
            <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow: 0 6px 18px rgba(16,24,40,0.08);">
              <tr>
                <td style="padding:28px 28px 8px; text-align:left;">
                  <h2 style="margin:0; font-size:20px; color:#0f172a;">PWSCoding — Password Reset</h2>
                </td>
              </tr>
  
              <tr>
                <td style="padding:0 28px 20px; color:#475569;">
                  <p style="margin:0 0 14px;">Hi ${name || 'there'},</p>
                  <p style="margin:0 0 16px;">
                    We received a request to reset the password for your account.
                    Click the button below to create a new password. This link is valid for <strong>5 minutes</strong>.
                  </p>
  
                  <table cellpadding="0" cellspacing="0" role="presentation" style="margin:18px 0;">
                    <tr>
                      <td align="left">
                        <a href="${resetLink}" target="_blank" rel="noopener" style="display:inline-block; text-decoration:none; padding:12px 20px; border-radius:8px; background:linear-gradient(90deg,#7c3aed,#06b6d4); color:#fff; font-weight:600;">
                          Reset Password
                        </a>
                      </td>
                    </tr>
                  </table>
  
                  <p style="margin:0 0 6px; font-size:13px; color:#6b7280;">
                    Or copy & paste this URL into your browser:
                  </p>
                  <p style="word-break:break-all; font-size:13px; color:#0f172a;">${resetLink}</p>
  
                  <hr style="border:none; border-top:1px solid #eef2ff; margin:20px 0;">
  
                  <p style="font-size:13px; color:#64748b; margin:0;">
                    If you didn't request a password reset, you can safely ignore this email. The link will expire automatically after 5 minutes.
                  </p>
  
                  <p style="font-size:13px; color:#64748b; margin-top:12px;">— PWSCoding</p>
                </td>
              </tr>
  
              <tr>
                <td style="background:#f8fafc; padding:12px 28px; text-align:center; font-size:12px; color:#94a3b8;">
                  © ${new Date().getFullYear()} PWSCoding. All rights reserved.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `
}

module.exports = { passwordResetEmail }
