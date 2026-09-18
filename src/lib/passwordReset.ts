import "server-only";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";

const TOKEN_TTL_MS = 60 * 60 * 1000;

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Creates a fresh single-use token (invalidating any previous one for this
 * user) and emails the reset link. Only the hash is stored, same principle
 * as email verification.
 */
export async function sendPasswordResetEmail(
  user: { id: string; email: string; name: string },
  origin: string
): Promise<boolean> {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
  await prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt } });

  const url = `${origin}/reset-password?token=${token}`;

  return sendMail({
    to: user.email,
    subject: "Réinitialise ton mot de passe — FollowMyScore",
    text: `Bonjour ${user.name},\n\nTu as demandé à réinitialiser ton mot de passe. Clique sur ce lien (valable 1h) :\n${url}\n\nSi tu n'es pas à l'origine de cette demande, ignore cet email — ton mot de passe ne change pas.`,
    html: `
      <p>Bonjour ${user.name},</p>
      <p>Tu as demandé à réinitialiser ton mot de passe FollowMyScore. Clique sur le lien ci-dessous (valable 1h) :</p>
      <p><a href="${url}">${url}</a></p>
      <p>Si tu n'es pas à l'origine de cette demande, ignore cet email — ton mot de passe ne change pas.</p>
    `,
  });
}

export type PasswordResetTokenCheck =
  | { status: "ok"; userId: string }
  | { status: "expired" | "invalid" };

export async function checkPasswordResetToken(token: string): Promise<PasswordResetTokenCheck> {
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!record) return { status: "invalid" };
  if (record.expiresAt < new Date()) return { status: "expired" };
  return { status: "ok", userId: record.userId };
}

export type ResetPasswordResult = "ok" | "expired" | "invalid";

export async function resetPasswordWithToken(token: string, newPassword: string): Promise<ResetPasswordResult> {
  const tokenHash = hashToken(token);
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!record) return "invalid";

  if (record.expiresAt < new Date()) {
    await prisma.passwordResetToken.delete({ where: { id: record.id } });
    return "expired";
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.deleteMany({ where: { userId: record.userId } }),
  ]);
  return "ok";
}
