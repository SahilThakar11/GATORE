/// <reference types="node" />
/**
 * ─── Admin: Review Business Access Requests ──────────────────────────────────
 *
 * Interactive CLI script for dev/admin to approve or reject
 * pending business access requests. Sends notification emails on decision.
 *
 * Usage:  npx ts-node scripts/admin-review.ts
 *         (run from the server/ directory)
 */

require("dotenv/config");

/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const nodemailer = require("nodemailer");
const readline = require("readline");

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const path = require("path");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // TODO: remove before production — dev workaround only
  tls: { rejectUnauthorized: false },
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (question: string): Promise<string> =>
  new Promise((resolve) => rl.question(question, resolve));

// ─── Email Templates ─────────────────────────────────────────────────────────

const BASE_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const YEAR = new Date().getFullYear();

function emailCard(bodyHtml: string, ctaHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <style>
    body { margin:0; padding:0; -webkit-text-size-adjust:100%; }
    table { border-collapse:collapse; }
    img { border:0; display:block; }
    a { color:inherit; }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#fffbf7;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#fffbf7;padding:40px 16px;">
    <tr>
      <td align="center">
        <div style="max-width:560px;border:1px solid #0f766e;border-radius:16px;overflow:hidden;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;">

          <!-- ── Header ── -->
          <tr>
            <td align="center" style="background-color:#f0fdfa;padding:28px 40px 24px;">
              <a href="#" style="cursor:default;text-decoration:none;display:block;pointer-events:none;">
                <img src="cid:gatore-logo" alt="Gatore" width="120" style="display:block;margin:0 auto 10px;height:auto;pointer-events:none;" />
              </a>
              <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:12px;color:#0f766e;letter-spacing:0.5px;">Business Portal</p>
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

          <!-- ── Divider ── -->
          <tr>
            <td style="background-color:#ffffff;padding:0 40px;">
              <div style="height:1px;background-color:#f5e6d8;"></div>
            </td>
          </tr>

          <!-- ── CTA ── -->
          <tr>
            <td style="background-color:#ffffff;padding:24px 40px 32px;">
              ${ctaHtml}
            </td>
          </tr>

          <!-- ── Footer ── -->
          <tr>
            <td style="background-color:#134e4a;padding:24px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td>
                    <p style="margin:0 0 2px;font-family:'DM Sans',Arial,sans-serif;font-size:15px;font-weight:900;color:#ffffff;letter-spacing:3px;">GATORE</p>
                    <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:11px;color:#ffffff;">Business Portal</p>
                  </td>
                  <td align="right">
                    <table cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td><a href="${BASE_URL}/for-cafe-owners" style="font-family:'DM Sans',Arial,sans-serif;font-size:11px;color:#ffffff;text-decoration:none;">Partner</a></td>
                        <td style="padding-left:16px;"><a href="${BASE_URL}/contact" style="font-family:'DM Sans',Arial,sans-serif;font-size:11px;color:#ffffff;text-decoration:none;">Contact</a></td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top:16px;">
                    <div style="height:1px;background-color:rgba(255,255,255,0.2);"></div>
                    <p style="margin:12px 0 0;font-family:'DM Sans',Arial,sans-serif;font-size:10px;color:#ffffff;text-align:center;">© ${YEAR} Gatore. All rights reserved.</p>
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

function buildApprovedEmail(ownerName: string, cafeName: string): string {
  const body = `
    <p style="margin:0 0 4px;font-family:'DM Sans',Arial,sans-serif;font-size:12px;color:#6b4d33;text-transform:uppercase;letter-spacing:1px;">Great news,</p>
    <p style="margin:0 0 20px;font-family:'DM Sans',Arial,sans-serif;font-size:22px;font-weight:700;color:#292524;">${ownerName} 🎉</p>

    <p style="margin:0 0 28px;font-family:'DM Sans',Arial,sans-serif;font-size:15px;color:#57534e;line-height:1.7;">
      Your business access request for <strong style="color:#292524;">${cafeName}</strong> has been <strong style="color:#0f766e;">approved</strong>! You can now sign in to the Gatore Business Portal to manage your café.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:28px;">
      <tr>
        <td align="center">
          <div style="display:inline-block;background-color:#f0fdfa;border:2px dashed #14b8a6;border-radius:14px;padding:24px 44px;text-align:center;">
            <p style="margin:0 0 12px;font-family:'DM Sans',Arial,sans-serif;font-size:11px;font-weight:700;color:#0d9488;letter-spacing:2px;text-transform:uppercase;">Account Status</p>
            <div style="display:inline-block;width:56px;height:56px;border-radius:50%;background-color:#ccfbf1;text-align:center;line-height:56px;margin-bottom:10px;">
              <div style="display:inline-block;width:40px;height:40px;border-radius:50%;background-color:#14b8a6;text-align:center;line-height:40px;vertical-align:middle;">
                <span style="color:#ffffff;font-size:20px;font-weight:900;line-height:40px;">&#10003;</span>
              </div>
            </div>
            <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:18px;font-weight:900;color:#0f766e;">Approved</p>
          </div>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td style="background-color:#fef7f0;border-left:3px solid #d4b896;border-radius:0 10px 10px 0;padding:12px 16px;">
          <p style="margin:0 0 4px;font-family:'DM Sans',Arial,sans-serif;font-size:13px;font-weight:700;color:#292524;">What's next?</p>
          <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:13px;color:#57534e;line-height:1.6;">
            Head to the Business Portal and sign in with your email. You'll receive a verification code to access your dashboard.
          </p>
        </td>
      </tr>
    </table>`;

  const cta = `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td style="padding-right:16px;">
          <p style="margin:0 0 3px;font-family:'DM Sans',Arial,sans-serif;font-size:11px;color:#c19a6b;letter-spacing:0.5px;">Ready to get started —</p>
          <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:14px;font-weight:700;color:#292524;">Sign in and start managing your café.</p>
        </td>
        <td align="right" style="white-space:nowrap;">
          <a href="${BASE_URL}/for-cafe-owners" style="display:inline-block;background-color:#0f766e;color:#ffffff;font-family:'DM Sans',Arial,sans-serif;font-size:13px;font-weight:700;text-decoration:none;padding:10px 20px;border-radius:10px;">Sign In \u2192</a>
        </td>
      </tr>
    </table>`;

  return emailCard(body, cta);
}

function buildRejectedEmail(ownerName: string, cafeName: string): string {
  const body = `
    <p style="margin:0 0 4px;font-family:'DM Sans',Arial,sans-serif;font-size:12px;color:#6b4d33;text-transform:uppercase;letter-spacing:1px;">Hello,</p>
    <p style="margin:0 0 20px;font-family:'DM Sans',Arial,sans-serif;font-size:22px;font-weight:700;color:#292524;">${ownerName}</p>

    <p style="margin:0 0 28px;font-family:'DM Sans',Arial,sans-serif;font-size:15px;color:#57534e;line-height:1.7;">
      Thank you for your interest in partnering with Gatore. After reviewing your access request for <strong style="color:#292524;">${cafeName}</strong>, we are unfortunately unable to approve it at this time.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:28px;">
      <tr>
        <td align="center">
          <div style="display:inline-block;background-color:#fef2f2;border:2px dashed #fca5a5;border-radius:14px;padding:24px 44px;">
            <p style="margin:0 0 8px;font-family:'DM Sans',Arial,sans-serif;font-size:11px;font-weight:700;color:#dc2626;letter-spacing:2px;text-transform:uppercase;">Request Status</p>
            <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:22px;font-weight:900;color:#b91c1c;">Not Approved</p>
          </div>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td style="background-color:#fef7f0;border-left:3px solid #d4b896;border-radius:0 10px 10px 0;padding:12px 16px;">
          <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:13px;color:#6b4d33;line-height:1.6;">
            This may be due to incomplete information or eligibility requirements. If you believe this was a mistake, feel free to reach out or submit a new request with updated details.
          </p>
        </td>
      </tr>
    </table>`;

  const cta = `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td style="padding-right:16px;">
          <p style="margin:0 0 3px;font-family:'DM Sans',Arial,sans-serif;font-size:11px;color:#c19a6b;letter-spacing:0.5px;">Have questions —</p>
          <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:14px;font-weight:700;color:#292524;">We're here to help.</p>
        </td>
        <td align="right" style="white-space:nowrap;">
          <a href="${BASE_URL}/contact" style="display:inline-block;background-color:#0f766e;color:#ffffff;font-family:'DM Sans',Arial,sans-serif;font-size:13px;font-weight:700;text-decoration:none;padding:10px 20px;border-radius:10px;">Contact Us \u2192</a>
        </td>
      </tr>
    </table>`;

  return emailCard(body, cta);
}

async function sendNotificationEmail(
  to: string,
  subject: string,
  html: string
) {
  try {
    await transporter.sendMail({
      from: `"Gatore Business" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      attachments: [
        {
          filename: "logo.png",
          path: path.join(__dirname, "../../client/public/logo.png"),
          cid: "gatore-logo",
        },
      ],
    });
    console.log(`  📧  Notification email sent to ${to}`);
  } catch (err) {
    console.log(`  ⚠️  Failed to send email to ${to} (non-blocking)`);
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║        GATORE — Business Access Request Review         ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  const pending = await prisma.businessAccessRequest.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "asc" },
  });

  if (pending.length === 0) {
    console.log("  ✅  No pending requests. You're all caught up!\n");
    return;
  }

  console.log(`  Found ${pending.length} pending request(s):\n`);

  for (const req of pending) {
    console.log("  ┌──────────────────────────────────────────────────────");
    console.log(`  │  ID:         ${req.id}`);
    console.log(`  │  Café Name:  ${req.cafeName}`);
    console.log(`  │  Owner:      ${req.ownerName}`);
    console.log(`  │  Email:      ${req.email}`);
    console.log(`  │  Phone:      ${req.phone || "—"}`);
    console.log(`  │  City:       ${req.city}`);
    console.log(`  │  Message:    ${req.message || "—"}`);
    console.log(
      `  │  Submitted:  ${req.createdAt.toLocaleDateString()} ${req.createdAt.toLocaleTimeString()}`
    );
    console.log("  └──────────────────────────────────────────────────────");

    let action = "";
    while (!["approve", "reject", "skip"].includes(action)) {
      action = (
        await ask("  → Action (approve / reject / skip): ")
      )
        .toLowerCase()
        .trim();
    }

    if (action === "skip") {
      console.log("  ⏭  Skipped.\n");
      continue;
    }

    if (action === "reject") {
      await prisma.businessAccessRequest.update({
        where: { id: req.id },
        data: { status: "rejected", reviewedAt: new Date() },
      });
      console.log("  ❌  Rejected.");

      // Send rejection email
      await sendNotificationEmail(
        req.email,
        "Gatore Business — Access Request Update",
        buildRejectedEmail(req.ownerName, req.cafeName)
      );
      console.log("");
      continue;
    }

    // ── Approve ──────────────────────────────────────────────────────────
    const existingUser = await prisma.user.findUnique({
      where: { email: req.email },
    });

    let approvedUser: { id: number };

    if (existingUser) {
      approvedUser = await prisma.user.update({
        where: { email: req.email },
        data: {
          role: "business",
          name: req.ownerName,
          emailVerified: true,
          isActive: true,
        },
      });
      console.log(
        `  ↑  Existing user (${req.email}) upgraded to business role.`
      );
    } else {
      approvedUser = await prisma.user.create({
        data: {
          email: req.email,
          name: req.ownerName,
          password: "",
          role: "business",
          emailVerified: true,
          isActive: true,
          authProvider: "email",
        },
      });
      console.log(`  ✨  Business user created for ${req.email}.`);
    }

    // Link the access request to the approved user so their application data
    // (café name, city, phone, contact) can pre-fill the setup wizard.
    await prisma.businessAccessRequest.update({
      where: { id: req.id },
      data: { status: "approved", reviewedAt: new Date(), userId: approvedUser.id },
    });
    console.log("  ✅  Approved.");

    // Send approval email
    await sendNotificationEmail(
      req.email,
      "🎉 Gatore Business — You're Approved!",
      buildApprovedEmail(req.ownerName, req.cafeName)
    );
    console.log("");
  }

  console.log("  Done! All pending requests have been reviewed.\n");
}

main()
  .catch((err: any) => {
    console.error("  ❌ Error:", err);
    process.exit(1);
  })
  .finally(async () => {
    rl.close();
    await prisma.$disconnect();
  });
