"use client";

import { useActionState } from "react";
import { updatePassword } from "@/app/actions/account";

export function UpdatePasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [state, action, pending] = useActionState(updatePassword, undefined);

  return (
    <form action={action} className="space-y-4">
      {!hasPassword && (
        <p className="text-sm text-zinc-500">
          Ton compte est connecté via Google ou Facebook et n&apos;a pas encore de mot de passe.
          Définis-en un pour pouvoir aussi te connecter avec ton email.
        </p>
      )}
      {hasPassword && (
        <div>
          <label htmlFor="currentPassword" className="mb-1 block text-sm font-medium">
            Mot de passe actuel
          </label>
          <input
            id="currentPassword"
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
      <div>
        <label htmlFor="newPassword" className="mb-1 block text-sm font-medium">
          {hasPassword ? "Nouveau mot de passe" : "Mot de passe"}
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          autoComplete="new-password"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        />
        {state?.fieldErrors?.newPassword && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.newPassword[0]}</p>
        )}
      </div>
      <div>
        <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium">
          Confirmer le {hasPassword ? "nouveau " : ""}mot de passe
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        />
        {state?.fieldErrors?.confirmPassword && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.confirmPassword[0]}</p>
        )}
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-emerald-600">{state.success}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Enregistrement…" : hasPassword ? "Changer le mot de passe" : "Définir le mot de passe"}
      </button>
    </form>
  );
}
