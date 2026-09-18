"use server";

import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validation";
import { sendMail } from "@/lib/mailer";

const CONTACT_NOTIFICATION_EMAIL = "contact@followmyscore.fr";

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

  const { name, email, message } = parsed.data;
  await sendMail({
    to: CONTACT_NOTIFICATION_EMAIL,
    replyTo: email,
    subject: `Nouveau message de contact — ${name}`,
    text: `De : ${name} <${email}>\n\n${message}`,
    html: `<p>De : ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p><p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`,
  }).catch((error) => {
    console.error("[contact] failed to send notification email", error);
  });

  return { success: "Ton message a bien été envoyé, merci ! On te répond dès que possible." };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
