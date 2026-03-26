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

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (question: string): Promise<string> =>
  new Promise((resolve) => rl.question(question, resolve));

// ─── Email Templates ─────────────────────────────────────────────────────────

function buildApprovedEmail(ownerName: string, cafeName: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Gatore – Access Approved</title>
</head>
<body style="margin:0;padding:0;background-color:#faf8f4;font-family:Georgia,serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#faf8f4;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td align="center" style="background-color:#0f4c3a;border-radius:16px 16px 0 0;padding:32px 40px 28px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <span style="font-family:Georgia,serif;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:3px;text-transform:uppercase;">GATORE</span>
                    <br/>
                    <span style="font-size:12px;color:rgba(255,255,255,0.65);letter-spacing:1px;font-family:Arial,sans-serif;">Business Portal</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Accent line -->
          <tr>
            <td style="height:4px;background:linear-gradient(to right,#0d9488,#14b8a6,#0d9488);"></td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:40px 40px 32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">

              <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Great news,</p>
              <h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:22px;font-weight:900;color:#111827;">${ownerName} 🎉</h1>

              <p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:15px;color:#4b5563;line-height:1.7;">
                Your business access request for <strong style="color:#111827;">${cafeName}</strong> has been <strong style="color:#0f766e;">approved</strong>! You can now sign in to the Gatore Business Portal to manage your café.
              </p>

              <!-- Success badge -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;background-color:#f0fdfa;border:2px solid #14b8a6;border-radius:16px;padding:20px 40px;">
                      <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#0d9488;letter-spacing:2px;text-transform:uppercase;">Account Status</p>
                      <p style="margin:0;font-family:Georgia,serif;font-size:24px;font-weight:900;color:#0f766e;">✅ Approved</p>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- What's next -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background-color:#f0fdfa;border-left:3px solid #14b8a6;border-radius:0 8px 8px 0;padding:16px;">
                    <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#0f766e;">What's next?</p>
                    <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#4b5563;line-height:1.7;">
                      Head to the Business Portal and sign in with your email. You'll receive a verification code to access your dashboard.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="background-color:#ffffff;padding:0 40px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
              <div style="height:1px;background-color:#f3f4f6;"></div>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="background-color:#ffffff;padding:24px 40px 32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:12px;color:#9ca3af;">Ready to get started?</p>
                    <p style="margin:0;font-family:Georgia,serif;font-size:15px;font-weight:700;color:#111827;">Sign in and start managing your café.</p>
                  </td>
                  <td align="right" style="white-space:nowrap;">
                    <a href="http://localhost:5173/for-cafe-owners"
                      style="display:inline-block;background-color:#0f4c3a;color:#ffffff;font-family:Arial,sans-serif;font-size:13px;font-weight:700;text-decoration:none;padding:10px 22px;border-radius:10px;">
                      Sign In →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#1c2326;border-radius:0 0 16px 16px;padding:28px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-family:Georgia,serif;font-size:16px;font-weight:900;color:#ffffff;letter-spacing:2px;">GATORE</p>
                    <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#6b7280;">Business Portal</p>
                  </td>
                  <td align="right">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-left:16px;">
                          <a href="http://localhost:5173/for-cafe-owners" style="font-family:Arial,sans-serif;font-size:11px;color:#9ca3af;text-decoration:none;">Partner</a>
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
                      © ${new Date().getFullYear()} Gatore. All rights reserved.
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
</html>`;
}

function buildRejectedEmail(ownerName: string, cafeName: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Gatore – Access Request Update</title>
</head>
<body style="margin:0;padding:0;background-color:#faf8f4;font-family:Georgia,serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#faf8f4;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td align="center" style="background-color:#0f4c3a;border-radius:16px 16px 0 0;padding:32px 40px 28px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <span style="font-family:Georgia,serif;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:3px;text-transform:uppercase;">GATORE</span>
                    <br/>
                    <span style="font-size:12px;color:rgba(255,255,255,0.65);letter-spacing:1px;font-family:Arial,sans-serif;">Business Portal</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Accent line -->
          <tr>
            <td style="height:4px;background:linear-gradient(to right,#0d9488,#14b8a6,#0d9488);"></td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:40px 40px 32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">

              <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Hello,</p>
              <h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:22px;font-weight:900;color:#111827;">${ownerName}</h1>

              <p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:15px;color:#4b5563;line-height:1.7;">
                Thank you for your interest in partnering with Gatore. After reviewing your access request for <strong style="color:#111827;">${cafeName}</strong>, we are unfortunately unable to approve it at this time.
              </p>

              <!-- Status badge -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;background-color:#fef2f2;border:2px solid #fca5a5;border-radius:16px;padding:20px 40px;">
                      <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#dc2626;letter-spacing:2px;text-transform:uppercase;">Request Status</p>
                      <p style="margin:0;font-family:Georgia,serif;font-size:24px;font-weight:900;color:#b91c1c;">Not Approved</p>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Info note -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background-color:#fef9f0;border-left:3px solid #f59e0b;border-radius:0 8px 8px 0;padding:16px;">
                    <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#92400e;line-height:1.7;">
                      This may be due to incomplete information or eligibility requirements. If you believe this was a mistake, feel free to reach out to us or submit a new request with updated details.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="background-color:#ffffff;padding:0 40px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
              <div style="height:1px;background-color:#f3f4f6;"></div>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="background-color:#ffffff;padding:24px 40px 32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:12px;color:#9ca3af;">Have questions?</p>
                    <p style="margin:0;font-family:Georgia,serif;font-size:15px;font-weight:700;color:#111827;">We're here to help.</p>
                  </td>
                  <td align="right" style="white-space:nowrap;">
                    <a href="http://localhost:5173/contact"
                      style="display:inline-block;background-color:#0f4c3a;color:#ffffff;font-family:Arial,sans-serif;font-size:13px;font-weight:700;text-decoration:none;padding:10px 22px;border-radius:10px;">
                      Contact Us →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#1c2326;border-radius:0 0 16px 16px;padding:28px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-family:Georgia,serif;font-size:16px;font-weight:900;color:#ffffff;letter-spacing:2px;">GATORE</p>
                    <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#6b7280;">Business Portal</p>
                  </td>
                  <td align="right">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-left:16px;">
                          <a href="http://localhost:5173/for-cafe-owners" style="font-family:Arial,sans-serif;font-size:11px;color:#9ca3af;text-decoration:none;">Partner</a>
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
                      © ${new Date().getFullYear()} Gatore. All rights reserved.
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
</html>`;
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
