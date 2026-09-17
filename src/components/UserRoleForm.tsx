"use client";

import { setUserRole } from "@/app/actions/admin";
import type { Role } from "../../generated/prisma/enums";

const OPTIONS: { value: Role; label: string }[] = [
  { value: "USER", label: "Utilisateur" },
  { value: "ADMIN", label: "Administrateur" },
];

export function UserRoleForm({ userId, role }: { userId: string; role: Role }) {
  const action = setUserRole.bind(null, userId);

  return (
    <form action={action} className="flex items-center gap-2">
      <select
        name="role"
        defaultValue={role}
        className="rounded-lg border border-border bg-background px-2 py-1 text-sm"
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-lg border border-border px-2.5 py-1 text-sm hover:border-accent"
      >
        Enregistrer
      </button>
    </form>
  );
}
