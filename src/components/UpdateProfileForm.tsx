"use client";

import { useActionState, useRef, useState } from "react";
import { updateProfile } from "@/app/actions/account";
import { checkUsernameAvailability } from "@/app/actions/auth";

const USERNAME_FORMAT = /^[a-z0-9_-]{3,24}$/;

type UsernameStatus = "idle" | "checking" | "available" | "taken";

export function UpdateProfileForm({
  name: initialName,
  username: initialUsername,
}: {
  name: string;
  username: string;
}) {
  const [state, action, pending] = useActionState(updateProfile, undefined);
  const [name, setName] = useState(initialName);
  const [username, setUsername] = useState(initialUsername);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  function handleUsernameChange(value: string) {
    setUsername(value);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const candidate = value.trim().toLowerCase();
    if (candidate === initialUsername.toLowerCase() || !USERNAME_FORMAT.test(candidate)) {
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

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-emerald-600">{state.success}</p>}

      <button
        type="submit"
        disabled={pending || usernameStatus === "taken" || usernameStatus === "checking"}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
