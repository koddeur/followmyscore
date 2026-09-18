import "server-only";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Creates a fresh single-use token (invalidating any previous one for this
 * user) and emails the verification link. Only the hash is stored — the raw
 * token exists solely in the emailed link, same principle as a password reset.
 */
export async function sendVerificationEmail(
  user: { id: string; email: string; name: string },
  origin: string
): Promise<boolean> {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } });
  await prisma.emailVerificationToken.create({ data: { userId: user.id, tokenHash, expiresAt } });

  const url = `${origin}/verify-email?token=${token}`;

  return sendMail({
    to: user.email,
    subject: "Confirme ton adresse email — FollowMyScore",
    text: `Bonjour ${user.name},\n\nConfirme ton adresse email en cliquant sur ce lien (valable 24h) :\n${url}\n\nSi tu n'es pas à l'origine de cette inscription, ignore cet email.`,
    html: `
      <p>Bonjour ${user.name},</p>
      <p>Confirme ton adresse email pour FollowMyScore en cliquant sur le lien ci-dessous (valable 24h) :</p>
      <p><a href="${url}">${url}</a></p>
      <p>Si tu n'es pas à l'origine de cette inscription, ignore cet email.</p>
    `,
  });
}

export type VerifyTokenResult = "ok" | "expired" | "invalid";

export async function consumeVerificationToken(token: string): Promise<VerifyTokenResult> {
  const tokenHash = hashToken(token);
  const record = await prisma.emailVerificationToken.findUnique({ where: { tokenHash } });
  if (!record) return "invalid";

  if (record.expiresAt < new Date()) {
    await prisma.emailVerificationToken.delete({ where: { id: record.id } });
    return "expired";
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { emailVerified: new Date() } }),
    prisma.emailVerificationToken.delete({ where: { id: record.id } }),
  ]);
  return "ok";
}
