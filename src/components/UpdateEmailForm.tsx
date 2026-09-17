"use client";

import { useActionState } from "react";
import { updateEmail } from "@/app/actions/account";

export function UpdateEmailForm({ email, hasPassword }: { email: string; hasPassword: boolean }) {
  const [state, action, pending] = useActionState(updateEmail, undefined);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={email}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        />
        {state?.fieldErrors?.email && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.email[0]}</p>
        )}
      </div>
      {hasPassword && (
        <div>
          <label htmlFor="currentPasswordEmail" className="mb-1 block text-sm font-medium">
            Mot de passe actuel
          </label>
          <input
            id="currentPasswordEmail"
            name="currentPassword"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
          {state?.fieldErrors?.currentPassword && (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.currentPassword[0]}</p>
          )}
        </div>
      )}

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-emerald-600">{state.success}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Enregistrement…" : "Changer l'email"}
      </button>
    </form>
  );
}
