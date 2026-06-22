import nodemailer from "nodemailer";

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
};

export const sendPasswordResetEmail = async (toEmail, resetUrl) => {
  // If SMTP isn't configured, log instead of throwing so auth flow
  // still works in local development without email set up.
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("[Email] SMTP not configured. Reset link:", resetUrl);
    return { mocked: true, resetUrl };
  }

  const mailer = getTransporter();

  await mailer.sendMail({
    from: process.env.EMAIL_FROM || "ChatSphere <no-reply@chatsphere.app>",
    to: toEmail,
    subject: "Reset your ChatSphere password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #0D0818; color: #ffffff; border-radius: 16px;">
        <h2 style="color: #A855F7;">ChatSphere</h2>
        <p>We received a request to reset your password. Click the button below to choose a new one. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #7C3AED; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">Reset Password</a>
        <p style="margin-top: 24px; color: #A1A1AA; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });

  return { mocked: false };
};
