"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPassword } from "@/app/actions/passwordReset";
import { PasswordField } from "@/components/PasswordField";

export function ResetPasswordForm({ token }: { token: string }) {
  const action = resetPassword.bind(null, token);
  const [state, formAction, pending] = useActionState(action, undefined);

  if (state?.success) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-emerald-600">{state.success}</p>
        <Link
          href="/login"
          className="inline-block rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <PasswordField
        id="newPassword"
        name="newPassword"
        label="Nouveau mot de passe"
        autoComplete="new-password"
        error={state?.fieldErrors?.newPassword?.[0]}
      />
      <PasswordField
        id="confirmPassword"
        name="confirmPassword"
        label="Confirmer le mot de passe"
        autoComplete="new-password"
        error={state?.fieldErrors?.confirmPassword?.[0]}
      />

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Enregistrement…" : "Réinitialiser le mot de passe"}
      </button>
    </form>
  );
}
