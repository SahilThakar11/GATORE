import nodemailer from "nodemailer";
import path from "path";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // TODO: remove before production — dev workaround only
  tls: { rejectUnauthorized: false },
});

/* ─────────────────────────────────────────────────────────────────
   Shared layout helper
   ───────────────────────────────────────────────────────────────── */
function emailLayout({
  preheader,
  headerBg,
  headerLabel,
  bodyHtml,
  ctaLabel,
  ctaHref,
  ctaPrompt,
  ctaSubtext,
  footerLinks,
  footerTagline,
  base,
}: {
  preheader: string;
  headerBg: string;
  headerLabel: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaHref?: string;
  ctaPrompt?: string;
  ctaSubtext?: string;
  footerLinks: { label: string; href: string }[];
  footerTagline: string;
  base: string;
}) {
  const year = new Date().getFullYear();
  const ctaSection = ctaLabel
    ? `
          <!-- ── Divider ── -->
          <tr>
            <td style="background-color:#ffffff;padding:0 40px;">
              <div style="height:1px;background-color:#f5e6d8;"></div>
            </td>
          </tr>

          <!-- ── CTA row ── -->
          <tr>
            <td style="background-color:#ffffff;padding:24px 40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="padding-right:16px;">
                    <p style="margin:0 0 3px;font-family:'DM Sans',Arial,sans-serif;font-size:11px;color:#c19a6b;letter-spacing:0.5px;">${ctaSubtext}</p>
                    <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:14px;font-weight:700;color:#292524;">${ctaPrompt}</p>
                  </td>
                  <td align="right" style="white-space:nowrap;">
                    <a href="${ctaHref}" style="display:inline-block;background-color:#0f766e;color:#ffffff;font-family:'DM Sans',Arial,sans-serif;font-size:13px;font-weight:700;text-decoration:none;padding:10px 20px;border-radius:10px;">${ctaLabel} \u2192</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
    : `
          <!-- ── Body bottom border ── -->
          <tr>
            <td style="background-color:#ffffff;height:8px;"></td>
          </tr>`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <!--[if !mso]><!-->
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <!--<![endif]-->
  <style>
    body { margin:0; padding:0; -webkit-text-size-adjust:100%; }
    table { border-collapse:collapse; }
    img { border:0; display:block; }
    a { color:inherit; }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#fffbf7;">

  <!-- Preheader text (hidden) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}</div>

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#fffbf7;padding:40px 16px;">
    <tr>
      <td align="center">
        <div style="max-width:560px;border:1px solid #0f766e;border-radius:16px;overflow:hidden;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;">

          <!-- ── Header ── -->
          <tr>
            <td align="center" style="background-color:${headerBg};padding:28px 40px 24px;">
              <a href="#" style="cursor:default;text-decoration:none;display:block;pointer-events:none;">
                <img src="cid:gatore-logo" alt="Gatore" width="120" style="display:block;margin:0 auto 10px;height:auto;pointer-events:none;" />
              </a>
              <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:12px;color:#0f766e;letter-spacing:0.5px;">${headerLabel}</p>
            </td>
          </tr>

          <!-- ── Teal accent line ── -->
          <tr>
            <td style="height:3px;background:linear-gradient(to right,#0d9488,#14b8a6,#0d9488);"></td>
          </tr>

          <!-- ── Body ── -->
          <tr>
            <td style="background-color:#ffffff;padding:40px 40px 32px;">
              ${bodyHtml}
            </td>
          </tr>

          ${ctaSection}

          <!-- ── Footer ── -->
          <tr>
            <td style="background-color:#134e4a;padding:24px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td>
                    <p style="margin:0 0 2px;font-family:'DM Sans',Arial,sans-serif;font-size:15px;font-weight:900;color:#ffffff;letter-spacing:3px;">GATORE</p>
                    <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:11px;color:#ffffff;">${footerTagline}</p>
                  </td>
                  <td align="right">
                    <table cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        ${footerLinks.map((l, i) => `<td style="${i > 0 ? "padding-left:16px;" : ""}"><a href="${l.href}" style="font-family:'DM Sans',Arial,sans-serif;font-size:11px;color:#ffffff;text-decoration:none;">${l.label}</a></td>`).join("\n                        ")}
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top:16px;">
                    <div style="height:1px;background-color:rgba(255,255,255,0.2);"></div>
                    <p style="margin:12px 0 0;font-family:'DM Sans',Arial,sans-serif;font-size:10px;color:#ffffff;text-align:center;">© ${year} Gatore. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        </div>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

/* ─────────────────────────────────────────────────────────────────
   OTP body block (shared between user + business)
   ───────────────────────────────────────────────────────────────── */
function otpBodyHtml(name: string, otp: string, context: string) {
  return `
    <p style="margin:0 0 4px;font-family:'DM Sans',Arial,sans-serif;font-size:12px;color:#6b4d33;text-transform:uppercase;letter-spacing:1px;">Hello,</p>
    <p style="margin:0 0 20px;font-family:'DM Sans',Arial,sans-serif;font-size:22px;font-weight:700;color:#292524;">${name}</p>

    <p style="margin:0 0 28px;font-family:'DM Sans',Arial,sans-serif;font-size:15px;color:#57534e;line-height:1.7;">
      You requested a verification code to access your ${context}. Use the code below — it expires in <strong style="color:#292524;">10 minutes</strong>.
    </p>

    <!-- OTP box -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:28px;">
      <tr>
        <td align="center">
          <div style="display:inline-block;background-color:#f0fdfa;border:2px dashed #14b8a6;border-radius:14px;padding:24px 44px;">
            <p style="margin:0 0 8px;font-family:'DM Sans',Arial,sans-serif;font-size:11px;font-weight:700;color:#0d9488;letter-spacing:2px;text-transform:uppercase;">Verification Code</p>
            <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:40px;font-weight:900;color:#0f766e;letter-spacing:12px;">${otp}</p>
          </div>
        </td>
      </tr>
    </table>

    <!-- Warning note -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:28px;">
      <tr>
        <td style="background-color:#fef7f0;border-left:3px solid #d4b896;border-radius:0 10px 10px 0;padding:12px 16px;">
          <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:12px;color:#6b4d33;line-height:1.6;">
            <strong>Never share this code with anyone.</strong> Gatore staff will never ask for your verification code.
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:13px;color:#0f766e;line-height:1.7;">
      If you didn't request this code, you can safely ignore this email.
    </p>`;
}

interface SendOTPEmailParams {
  to: string;
  name: string;
  otp: string;
}

export const sendOTPEmail = async ({ to, name, otp }: SendOTPEmailParams) => {
  const base = process.env.FRONTEND_URL || "http://localhost:5173";
  try {
    await transporter.sendMail({
      from: `"Gatore" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Your Gatore Verification Code",
      html: emailLayout({
        preheader: `Your Gatore verification code is ${otp}. Valid for 10 minutes.`,
        headerBg: "#f0fdfa",
        headerLabel: "Find your game. Book your table.",
        bodyHtml: otpBodyHtml(name, otp, "Gatore account"),
        ctaLabel: "Find a Café",
        ctaHref: `${base}/find-a-cafe`,
        ctaSubtext: "While you're here —",
        ctaPrompt: "Find a café near you and book your table today.",
        footerLinks: [
          { label: "Find a Café", href: `${base}/find-a-cafe` },
          { label: "How It Works", href: `${base}/how-it-works` },
          { label: "Contact", href: `${base}/contact` },
        ],
        footerTagline: "Find your game. Book your table.",
        base,
      }),
      attachments: [
        {
          filename: "logo.png",
          path: path.join(__dirname, "../../../client/public/logo.png"),
          cid: "gatore-logo",
        },
      ],
    });
    console.log("✅ OTP email sent via Gmail SMTP");
  } catch (error) {
    console.error("❌ Gmail SMTP Error:", error);
    throw new Error("Failed to send OTP email");
  }
};

export const sendBusinessOTPEmail = async ({
  to,
  name,
  otp,
}: SendOTPEmailParams) => {
  const base = process.env.FRONTEND_URL || "http://localhost:5173";
  try {
    await transporter.sendMail({
      from: `"Gatore Business" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Your Gatore Business Portal Verification Code",
      html: emailLayout({
        preheader: `Your Gatore Business Portal verification code is ${otp}. Valid for 10 minutes.`,
        headerBg: "#f0fdfa",
        headerLabel: "Business Portal",
        bodyHtml: otpBodyHtml(name, otp, "Gatore Business Portal"),
        footerLinks: [
          { label: "Partner", href: `${base}/for-cafe-owners` },
          { label: "Pricing", href: `${base}/pricing` },
          { label: "Contact", href: `${base}/contact` },
        ],
        footerTagline: "Business Portal",
        base,
      }),
      attachments: [
        {
          filename: "logo.png",
          path: path.join(__dirname, "../../../client/public/logo.png"),
          cid: "gatore-logo",
        },
      ],
    });
    console.log("✅ Business OTP email sent via Gmail SMTP");
  } catch (error) {
    console.error("❌ Gmail SMTP Error (Business):", error);
    throw new Error("Failed to send business OTP email");
  }
};
