import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { Role } from "../../generated/prisma/enums";

const roleRank: Record<Role, number> = {
  USER: 0,
  ADMIN: 1,
};

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireUser(redirectTo = "/login") {
  const user = await getCurrentUser();
  if (!user) {
    redirect(redirectTo);
  }
  return user;
}

export async function requireRole(role: Role, redirectTo = "/") {
  const user = await requireUser();
  if (roleRank[user.role] < roleRank[role]) {
    redirect(redirectTo);
  }
  return user;
}

export function hasRole(userRole: Role, role: Role) {
  return roleRank[userRole] >= roleRank[role];
}
