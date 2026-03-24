import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

// Set RESEND_FROM_EMAIL to your verified Resend domain address.
// Falls back to onboarding@resend.dev which only works when sending to
// the Resend account owner's email (useful for local testing).
const FROM = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev"

type SendPortalEmailParams = {
  to: string
  clientName: string
  projectName: string
  agencyName: string
  portalUrl: string
}

export async function sendPortalEmail({
  to,
  clientName,
  projectName,
  agencyName,
  portalUrl,
}: SendPortalEmailParams): Promise<void> {
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `Your ${projectName} assets are ready — ${agencyName}`,
    html: buildEmailHtml({ clientName, projectName, agencyName, portalUrl }),
  })

  if (error) throw new Error(`Failed to send email: ${error.message}`)
}

function buildEmailHtml({
  clientName,
  projectName,
  agencyName,
  portalUrl,
}: Omit<SendPortalEmailParams, "to">) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your assets are ready</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;border:1px solid #e5e7eb;padding:40px 36px;">
          <tr>
            <td>
              <p style="margin:0 0 4px;font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#6366f1;">
                ${agencyName}
              </p>
              <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#111827;line-height:1.3;">
                Your ${projectName} assets are ready
              </h1>
              <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.6;">
                Hi ${clientName},<br/><br/>
                ${agencyName} has prepared all deliverables and credentials for <strong style="color:#111827;">${projectName}</strong>.
                Click the button below to review your assets and complete the handover.
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:100px;background:#111827;">
                    <a href="${portalUrl}"
                       style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:100px;">
                      View Your Assets →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:28px 0 0;font-size:12px;color:#9ca3af;">
                This link expires in 7 days. If you weren't expecting this email, you can safely ignore it.
              </p>
              <hr style="margin:28px 0;border:none;border-top:1px solid #f3f4f6;" />
              <p style="margin:0;font-size:12px;color:#d1d5db;text-align:center;">
                Delivered via <strong style="color:#9ca3af;">Ceal AI</strong> — Certified Project Handoff
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
