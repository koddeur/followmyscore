"use server";

import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validation";

export type ContactFormState =
  | {
      error?: string;
      success?: string;
      fieldErrors?: Record<string, string[]>;
    }
  | undefined;

export async function submitContactMessage(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await prisma.contactMessage.create({ data: parsed.data });

  return { success: "Ton message a bien été envoyé, merci ! On te répond dès que possible." };
}
