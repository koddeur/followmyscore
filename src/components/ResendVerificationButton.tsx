"use client";

import { useState } from "react";
import { resendVerificationEmail } from "@/app/actions/emailVerification";

export function ResendVerificationButton() {
  const [state, setState] = useState<{ pending: boolean; message: string | null; error: boolean }>({
    pending: false,
    message: null,
    error: false,
  });

  async function handleClick() {
    setState({ pending: true, message: null, error: false });
    const result = await resendVerificationEmail();
    if ("error" in result && result.error) {
      setState({ pending: false, message: result.error, error: true });
      return;
    }
    setState({ pending: false, message: result.success ?? null, error: false });
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={state.pending}
        className="font-medium text-accent hover:underline disabled:opacity-60"
      >
        {state.pending ? "Envoi…" : "Renvoyer l'email"}
      </button>
      {state.message && (
        <span className={state.error ? "text-red-600" : "text-zinc-500"}>{state.message}</span>
      )}
    </span>
  );
}
