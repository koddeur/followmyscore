"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { deleteMatch } from "@/app/actions/matches";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export function DeleteMatchButton({ matchId, label }: { matchId: string; label: string }) {
  const action = deleteMatch.bind(null, matchId);
  const [confirming, setConfirming] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setConfirming(true);
  }

  function handleConfirm() {
    setConfirming(false);
    action();
  }

  return (
    <>
      <ConfirmDialog
        open={confirming}
        message={`Supprimer définitivement le match ${label} ? Cette action est irréversible et supprimera aussi les buts, cartons, compositions et commentaires associés.`}
        onConfirm={handleConfirm}
        onCancel={() => setConfirming(false)}
        confirmLabel="Supprimer"
      />
      <form action={action} onSubmit={handleSubmit}>
        <button
          type="submit"
          className="rounded-lg border border-red-600 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-600 hover:text-white"
        >
          Supprimer le match
        </button>
      </form>
    </>
  );
}
