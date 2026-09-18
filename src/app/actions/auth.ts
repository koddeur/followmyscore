"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { registerSchema, usernameSchema } from "@/lib/validation";
import { sendVerificationEmail } from "@/lib/emailVerification";
import { getOrigin } from "@/lib/origin";

export type AuthFormState =
  | {
      error?: string;
      fieldErrors?: Partial<
        Record<"name" | "username" | "email" | "password" | "confirmPassword", string[]>
      >;
    }
  | undefined;

function safeRedirectPath(value: FormDataEntryValue | null): string {
  if (typeof value === "string" && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return "/";
}

export async function authenticate(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  try {
    await signIn("credentials", {
      identifier: formData.get("identifier"),
      password: formData.get("password"),
      redirectTo: safeRedirectPath(formData.get("callbackUrl")),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Email/nom d'utilisateur ou mot de passe incorrect." };
        default:
          return { error: "Une erreur est survenue, réessaie." };
      }
    }
    throw error;
  }
  return undefined;
}

export async function registerUser(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { name, username, email, password } = parsed.data;

  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
  if (existing) {
    return {
      error:
        existing.email === email
          ? "Un compte existe déjà avec cet email."
          : "Ce nom d'utilisateur est déjà pris.",
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, username, email, passwordHash, role: "USER" },
  });

  const origin = await getOrigin();
  await sendVerificationEmail(user, origin).catch((error) => {
    console.error("[register] failed to send verification email", error);
  });

  try {
    await signIn("credentials", { identifier: email, password, redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: "Compte créé. La connexion automatique a échoué, connecte-toi manuellement.",
      };
    }
    throw error;
  }
  return undefined;
}

export async function checkUsernameAvailability(username: string): Promise<boolean> {
  const parsed = usernameSchema.safeParse(username);
  if (!parsed.success) return false;

  const existing = await prisma.user.findUnique({ where: { username: parsed.data } });
  return !existing;
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}

export async function oauthSignIn(formData: FormData) {
  const provider = formData.get("provider");
  if (provider !== "google" && provider !== "facebook") return;

  await signIn(provider, { redirectTo: safeRedirectPath(formData.get("callbackUrl")) });
}
