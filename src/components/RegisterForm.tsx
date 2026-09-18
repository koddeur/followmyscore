"use client";

import { useActionState, useRef, useState } from "react";
import { registerUser, checkUsernameAvailability } from "@/app/actions/auth";
import { PasswordField } from "@/components/PasswordField";

const USERNAME_FORMAT = /^[a-z0-9_-]{3,24}$/;

type UsernameStatus = "idle" | "checking" | "available" | "taken";

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerUser, undefined);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  function handleUsernameChange(value: string) {
    setUsername(value);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const candidate = value.trim().toLowerCase();
    if (!USERNAME_FORMAT.test(candidate)) {
      requestIdRef.current++;
      setUsernameStatus("idle");
      return;
    }

    setUsernameStatus("checking");
    const requestId = ++requestIdRef.current;
    timeoutRef.current = setTimeout(async () => {
      const available = await checkUsernameAvailability(candidate);
      if (requestId !== requestIdRef.current) return;
      setUsernameStatus(available ? "available" : "taken");
    }, 400);
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          Nom
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        />
        {state?.fieldErrors?.name && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.name[0]}</p>
        )}
      </div>
      <div>
        <label htmlFor="username" className="mb-1 block text-sm font-medium">
          Nom d&apos;utilisateur
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          autoComplete="username"
          placeholder="ex : mael"
          value={username}
          onChange={(e) => handleUsernameChange(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        />
        {usernameStatus === "checking" && (
          <p className="mt-1 text-xs text-zinc-500">Vérification…</p>
        )}
        {usernameStatus === "available" && (
          <p className="mt-1 text-xs text-emerald-600">Nom d&apos;utilisateur disponible.</p>
        )}
        {usernameStatus === "taken" && (
          <p className="mt-1 text-xs text-red-600">Ce nom d&apos;utilisateur est déjà pris.</p>
        )}
        {state?.fieldErrors?.username && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.username[0]}</p>
        )}
      </div>
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        />
        {state?.fieldErrors?.email && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.email[0]}</p>
        )}
      </div>
      <PasswordField
        id="password"
        name="password"
        label="Mot de passe"
        autoComplete="new-password"
        value={password}
        onChange={setPassword}
        error={state?.fieldErrors?.password?.[0]}
      />
      <PasswordField
        id="confirmPassword"
        name="confirmPassword"
        label="Confirmer le mot de passe"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        error={state?.fieldErrors?.confirmPassword?.[0]}
      />

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending || usernameStatus === "taken" || usernameStatus === "checking"}
        className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Création…" : "Créer mon compte"}
      </button>
    </form>
  );
}
