"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { commentSchema } from "@/lib/validation";

export async function addComment(matchId: string, formData: FormData) {
  const user = await requireUser();

  const parsed = commentSchema.safeParse({ body: formData.get("body") });
  if (!parsed.success) return;

  await prisma.comment.create({
    data: { matchId, userId: user.id, body: parsed.data.body },
  });

  revalidatePath("/matches/[slug]", "page");
}

export async function updateComment(commentId: string, formData: FormData) {
  const user = await requireUser();

  const parsed = commentSchema.safeParse({ body: formData.get("body") });
  if (!parsed.success) return;

  await prisma.comment.updateMany({
    where: { id: commentId, userId: user.id },
    data: { body: parsed.data.body },
  });

  revalidatePath("/matches/[slug]", "page");
}

export async function deleteComment(commentId: string) {
  const user = await requireUser();

  await prisma.comment.deleteMany({
    where: user.role === "ADMIN" ? { id: commentId } : { id: commentId, userId: user.id },
  });

  revalidatePath("/matches/[slug]", "page");
}
