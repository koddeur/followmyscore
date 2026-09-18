"use client";

import { useActionState } from "react";
import { requestPasswordReset } from "@/app/actions/passwordReset";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, undefined);

  if (state?.success) {
    return <p className="text-sm text-emerald-600">{state.success}</p>;
  }

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
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        />
        {state?.fieldErrors?.email && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.email[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Envoi…" : "Envoyer le lien de réinitialisation"}
      </button>
    </form>
  );
}
