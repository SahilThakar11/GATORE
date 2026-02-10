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
        <div style="font-family: Arial; max-width: 600px; margin:auto;">
          <h2>Hello ${name},</h2>
          <p>Your verification code is:</p>
          <h1 style="letter-spacing: 6px;">${otp}</h1>
          <p>This code expires in 10 minutes.</p>
        </div>
      `,
    });

    console.log("✅ OTP email sent via Gmail SMTP");
  } catch (error) {
    console.error("❌ Gmail SMTP Error:", error);
    throw new Error("Failed to send OTP email");
  }
};

export const sendPasswordResetEmail = sendOTPEmail;
