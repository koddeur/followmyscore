"use server";

import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema, resetPasswordSchema } from "@/lib/validation";
import { sendPasswordResetEmail, resetPasswordWithToken } from "@/lib/passwordReset";
import { getOrigin } from "@/lib/origin";

export type ForgotPasswordFormState =
  | {
      error?: string;
      success?: string;
      fieldErrors?: Record<string, string[]>;
    }
  | undefined;

// Always returns the same generic success message whether or not an account
// exists for that email, so this can't be used to probe which emails are
// registered.
const GENERIC_SUCCESS =
  "Si un compte existe avec cet email, un lien de réinitialisation vient de lui être envoyé.";

export async function requestPasswordReset(
  _prevState: ForgotPasswordFormState,
  formData: FormData
): Promise<ForgotPasswordFormState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (user) {
    const origin = await getOrigin();
    await sendPasswordResetEmail(user, origin).catch((error) => {
      console.error("[forgotPassword] failed to send reset email", error);
    });
  }

  return { success: GENERIC_SUCCESS };
}

export type ResetPasswordFormState =
  | {
      error?: string;
      success?: string;
      fieldErrors?: Record<string, string[]>;
    }
  | undefined;

export async function resetPassword(
  token: string,
  _prevState: ResetPasswordFormState,
  formData: FormData
): Promise<ResetPasswordFormState> {
  const parsed = resetPasswordSchema.safeParse({
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const result = await resetPasswordWithToken(token, parsed.data.newPassword);
  if (result === "invalid") {
    return { error: "Ce lien de réinitialisation est invalide ou a déjà été utilisé." };
  }
  if (result === "expired") {
    return { error: "Ce lien de réinitialisation a expiré. Refais une demande." };
  }

  return { success: "Mot de passe mis à jour ! Tu peux te connecter." };
}
