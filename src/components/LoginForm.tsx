"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { authenticate } from "@/app/actions/auth";
import { PasswordField } from "@/components/PasswordField";

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, action, pending] = useActionState(authenticate, undefined);
  const [identifier, setIdentifier] = useState("");

  return (
    <form action={action} className="space-y-4">
      {callbackUrl && <input type="hidden" name="callbackUrl" value={callbackUrl} />}
      <div>
        <label htmlFor="identifier" className="mb-1 block text-sm font-medium">
          Email ou nom d&apos;utilisateur
        </label>
        <input
          id="identifier"
          name="identifier"
          type="text"
          required
          autoComplete="username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>
      <PasswordField
        id="password"
        name="password"
        label="Mot de passe"
        autoComplete="current-password"
        labelAddon={
          <Link href="/forgot-password" className="text-xs font-medium text-accent hover:underline">
            Mot de passe oublié ?
          </Link>
        }
      />

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
