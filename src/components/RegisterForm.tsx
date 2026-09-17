"use client";

import { useActionState, useRef, useState } from "react";
import { registerUser, checkUsernameAvailability } from "@/app/actions/auth";

const USERNAME_FORMAT = /^[a-z0-9_-]{3,24}$/;

type UsernameStatus = "idle" | "checking" | "available" | "taken";

function PasswordField({
  id,
  name,
  label,
  autoComplete,
  value,
  onChange,
  error,
}: {
  id: string;
  name: string;
  label: string;
  autoComplete: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          required
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-10 text-sm outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-foreground"
          aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          title={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        >
          {visible ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none h-4 w-4"
              aria-hidden="true"
            >
              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
              <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
              <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
              <line x1="2" x2="22" y1="2" y2="22" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none h-4 w-4"
              aria-hidden="true"
            >
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

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
