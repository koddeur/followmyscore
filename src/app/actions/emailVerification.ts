"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { sendVerificationEmail } from "@/lib/emailVerification";
import { getOrigin } from "@/lib/origin";

export async function resendVerificationEmail(): Promise<{ error?: string; success?: string }> {
  const user = await requireUser();

  const dbUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
  if (dbUser.emailVerified) {
    return { success: "Ton email est déjà vérifié." };
  }

  const origin = await getOrigin();
  const sent = await sendVerificationEmail(dbUser, origin);
  if (!sent) {
    return { error: "Impossible d'envoyer l'email pour le moment, réessaie plus tard." };
  }
  return { success: "Email de vérification renvoyé — vérifie ta boîte de réception." };
}
