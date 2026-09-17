"use client";

import { useActionState, useState } from "react";
import type { FormEvent } from "react";
import { deleteAccount } from "@/app/actions/account";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export function DeleteAccountForm({ hasPassword }: { hasPassword: boolean }) {
  const [state, action, pending] = useActionState(deleteAccount, undefined);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPendingFormData(new FormData(event.currentTarget));
  }

  function confirmDelete() {
    if (pendingFormData) {
      action(pendingFormData);
    }
    setPendingFormData(null);
  }

  return (
    <>
      <ConfirmDialog
        open={pendingFormData !== null}
        message="Supprimer définitivement ton compte ? Cette action est irréversible."
        onConfirm={confirmDelete}
        onCancel={() => setPendingFormData(null)}
        confirmLabel="Supprimer mon compte"
      />
      <form action={action} onSubmit={handleSubmit} className="space-y-4">
        {hasPassword && (
          <div>
            <label htmlFor="currentPasswordDelete" className="mb-1 block text-sm font-medium">
              Mot de passe actuel
            </label>
            <input
              id="currentPasswordDelete"
              name="currentPassword"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
        )}

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg border border-red-600 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-600 hover:text-white disabled:opacity-60"
        >
          {pending ? "Suppression…" : "Supprimer mon compte"}
        </button>
      </form>
    </>
  );
}
