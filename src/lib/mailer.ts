import "server-only";
import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT ?? 587);
const secure = process.env.SMTP_SECURE === "true";
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASSWORD;
// Some hosting panels store env values with the surrounding quotes taken literally
// (e.g. `"Name <email>"` including the quote characters), which breaks address
// parsing and gets the sender rejected by the SMTP server as unrecognized.
const from = (process.env.SMTP_FROM || user)?.trim().replace(/^"(.*)"$/, "$1");

export function isMailerEnabled(): boolean {
  return Boolean(host && user && pass);
}

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
  }
  return transporter;
}

/** Returns false (without throwing) when SMTP isn't configured, so callers can degrade gracefully. */
export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}): Promise<boolean> {
  if (!isMailerEnabled()) {
    console.warn(`[mailer] SMTP not configured — skipped email to ${opts.to}`);
    return false;
  }

  await getTransporter().sendMail({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
    replyTo: opts.replyTo,
  });
  return true;
}
