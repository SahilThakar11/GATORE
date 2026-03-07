import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface SendOTPEmailParams {
  to: string;
  name: string;
  otp: string;
}

export const sendOTPEmail = async ({ to, name, otp }: SendOTPEmailParams) => {
  try {
    await transporter.sendMail({
      from: `"Gatore" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Your Gatore Verification Code",
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Gatore – Verification Code</title>
</head>
<body style="margin:0;padding:0;background-color:#faf8f4;font-family:Georgia,serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#faf8f4;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- ── Header ── -->
          <tr>
            <td align="center" style="background-color:#0f766e;border-radius:16px 16px 0 0;padding:32px 40px 28px;">

              <!-- Logo row -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <span style="font-family:Georgia,serif;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:3px;text-transform:uppercase;">GATORE</span>
                    <br/>
                    <span style="font-size:12px;color:rgba(255,255,255,0.65);letter-spacing:1px;font-family:Arial,sans-serif;">Find your game. Book your table.</span>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ── Teal accent line ── -->
          <tr>
            <td style="height:4px;background:linear-gradient(to right,#0d9488,#14b8a6,#0d9488);"></td>
          </tr>

          <!-- ── Body ── -->
          <tr>
            <td style="background-color:#ffffff;padding:40px 40px 32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">

              <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Hello,</p>
              <h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:22px;font-weight:900;color:#111827;">${name} 👋</h1>

              <p style="margin:0 0 28px;font-family:Arial,sans-serif;font-size:15px;color:#4b5563;line-height:1.7;">
                You requested a verification code to access your Gatore account. Use the code below — it's valid for <strong style="color:#111827;">10 minutes</strong>.
              </p>

              <!-- OTP box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;background-color:#f0fdfa;border:2px dashed #14b8a6;border-radius:16px;padding:28px 48px;">
                      <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#0d9488;letter-spacing:2px;text-transform:uppercase;">Verification Code</p>
                      <p style="margin:0;font-family:'Courier New',monospace;font-size:42px;font-weight:900;color:#0f766e;letter-spacing:14px;">${otp}</p>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Warning note -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background-color:#fef9f0;border-left:3px solid #f59e0b;border-radius:0 8px 8px 0;padding:12px 16px;">
                    <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#92400e;line-height:1.6;">
                      ⚠️&nbsp; <strong>Never share this code with anyone.</strong> Gatore staff will never ask for your verification code.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#9ca3af;line-height:1.7;">
                If you didn't request this code, you can safely ignore this email. Someone may have entered your email address by mistake.
              </p>

            </td>
          </tr>

          <!-- ── Warm divider ── -->
          <tr>
            <td style="background-color:#ffffff;padding:0 40px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
              <div style="height:1px;background-color:#f3f4f6;"></div>
            </td>
          </tr>

          <!-- ── CTA row ── -->
          <tr>
            <td style="background-color:#ffffff;padding:24px 40px 32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:12px;color:#9ca3af;">While you're here —</p>
                    <p style="margin:0;font-family:Georgia,serif;font-size:15px;font-weight:700;color:#111827;">Find a café near you and book your table today.</p>
                  </td>
                  <td align="right" style="white-space:nowrap;">
                    <a href="http://localhost:5173/find-a-cafe"
                      style="display:inline-block;background-color:#0f766e;color:#ffffff;font-family:Arial,sans-serif;font-size:13px;font-weight:700;text-decoration:none;padding:10px 22px;border-radius:10px;">
                      Find a Café →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Footer ── -->
          <tr>
            <td style="background-color:#1c2326;border-radius:0 0 16px 16px;padding:28px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-family:Georgia,serif;font-size:16px;font-weight:900;color:#ffffff;letter-spacing:2px;">GATORE</p>
                    <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#6b7280;">Find your game. Book your table.</p>
                  </td>
                  <td align="right">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-left:16px;">
                          <a href="http://localhost:5173/find-a-cafe" style="font-family:Arial,sans-serif;font-size:11px;color:#9ca3af;text-decoration:none;">Find a Café</a>
                        </td>
                        <td style="padding-left:16px;">
                          <a href="http://localhost:5173/how-it-works" style="font-family:Arial,sans-serif;font-size:11px;color:#9ca3af;text-decoration:none;">How It Works</a>
                        </td>
                        <td style="padding-left:16px;">
                          <a href="http://localhost:5173/contact" style="font-family:Arial,sans-serif;font-size:11px;color:#9ca3af;text-decoration:none;">Contact</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top:20px;border-top:1px solid #2d3748;margin-top:20px;">
                    <p style="margin:16px 0 0;font-family:Arial,sans-serif;font-size:10px;color:#4b5563;text-align:center;">
                      © ${new Date().getFullYear()} Gatore. All rights reserved.&nbsp;&nbsp;·&nbsp;&nbsp;
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
      `,
    });

    console.log("✅ OTP email sent via Gmail SMTP");
  } catch (error) {
    console.error("❌ Gmail SMTP Error:", error);
    throw new Error("Failed to send OTP email");
  }
};
