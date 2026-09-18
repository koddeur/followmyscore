"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { signOut } from "@/auth";
import {
  updateProfileSchema,
  updateEmailSchema,
  updatePasswordSchema,
  avatarSchema,
} from "@/lib/validation";
import { sendVerificationEmail } from "@/lib/emailVerification";
import { getOrigin } from "@/lib/origin";

export type AccountFormState =
  | {
      error?: string;
      success?: string;
      fieldErrors?: Record<string, string[]>;
    }
  | undefined;

export async function updateProfile(
  _prevState: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  const user = await requireUser();

  const parsed = updateProfileSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { name, username } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { username, NOT: { id: user.id } },
  });
  if (existing) {
    return { error: "Ce nom d'utilisateur est déjà pris." };
  }

  await prisma.user.update({ where: { id: user.id }, data: { name, username } });

  revalidatePath("/account");
  return { success: "Profil mis à jour." };
}

export async function updateEmail(
  _prevState: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  const user = await requireUser();

  const parsed = updateEmailSchema.safeParse({
    email: formData.get("email"),
    currentPassword: formData.get("currentPassword") || undefined,
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { email, currentPassword } = parsed.data;

  const dbUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });

  // Accounts created via Google/Facebook have no password to confirm — the
  // session itself is the proof of identity in that case.
  if (dbUser.passwordHash) {
    if (!currentPassword) {
      return { error: "Mot de passe actuel requis." };
    }
    const validPassword = await bcrypt.compare(currentPassword, dbUser.passwordHash);
    if (!validPassword) {
      return { error: "Mot de passe actuel incorrect." };
    }
  }

  const existing = await prisma.user.findFirst({
    where: { email, NOT: { id: user.id } },
  });
  if (existing) {
    return { error: "Un compte existe déjà avec cet email." };
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { email, emailVerified: null },
  });

  const origin = await getOrigin();
  await sendVerificationEmail(updated, origin).catch((error) => {
    console.error("[updateEmail] failed to send verification email", error);
  });

  revalidatePath("/account");
  return {
    success:
      "Email mis à jour — un lien de vérification vient de t'être envoyé. Reconnecte-toi pour que ça se reflète partout.",
  };
}

export async function updatePassword(
  _prevState: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  const user = await requireUser();

  const parsed = updatePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword") || undefined,
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { currentPassword, newPassword } = parsed.data;

  const dbUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });

  // No existing password (Google/Facebook account): this is "set a
  // password" rather than "change password", nothing to confirm first.
  if (dbUser.passwordHash) {
    if (!currentPassword) {
      return { error: "Mot de passe actuel requis." };
    }
    const validPassword = await bcrypt.compare(currentPassword, dbUser.passwordHash);
    if (!validPassword) {
      return { error: "Mot de passe actuel incorrect." };
    }
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return {
    success: dbUser.passwordHash
      ? "Mot de passe mis à jour."
      : "Mot de passe défini. Tu peux désormais te connecter avec ton email et ce mot de passe.",
  };
}

export async function updateAvatar(
  _prevState: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  const user = await requireUser();

  const parsed = avatarSchema.safeParse({ avatar: formData.get("avatar") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Image invalide." };
  }

  await prisma.user.update({ where: { id: user.id }, data: { avatarUrl: parsed.data.avatar } });

  revalidatePath("/account");
  revalidatePath(`/users/${user.username}`);
  return { success: "Photo de profil mise à jour." };
}

export async function removeAvatar() {
  const user = await requireUser();

  await prisma.user.update({ where: { id: user.id }, data: { avatarUrl: null } });

  revalidatePath("/account");
  revalidatePath(`/users/${user.username}`);
}

export async function deleteAccount(
  _prevState: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  const user = await requireUser();

  const dbUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });

  if (dbUser.passwordHash) {
    const currentPassword = formData.get("currentPassword");
    if (typeof currentPassword !== "string" || currentPassword.length === 0) {
      return { error: "Mot de passe actuel requis." };
    }
    const validPassword = await bcrypt.compare(currentPassword, dbUser.passwordHash);
    if (!validPassword) {
      return { error: "Mot de passe actuel incorrect." };
    }
  }

  await prisma.user.delete({ where: { id: user.id } });

  await signOut({ redirectTo: "/" });
}
