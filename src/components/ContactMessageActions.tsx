"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { setContactMessageRead, deleteContactMessage } from "@/app/actions/admin";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export function ContactMessageActions({ messageId, read }: { messageId: string; read: boolean }) {
  const toggleAction = setContactMessageRead.bind(null, messageId, !read);
  const deleteAction = deleteContactMessage.bind(null, messageId);
  const [confirming, setConfirming] = useState(false);

  function handleDeleteSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setConfirming(true);
  }

  function handleConfirmDelete() {
    setConfirming(false);
    deleteAction();
  }

  return (
    <div className="flex items-center justify-end gap-3">
      <ConfirmDialog
        open={confirming}
        message="Supprimer définitivement ce message ?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirming(false)}
        confirmLabel="Supprimer"
      />
      <form action={toggleAction}>
        <button type="submit" className="rounded-lg border border-border px-2.5 py-1 text-xs hover:border-accent">
          {read ? "Marquer non lu" : "Marquer lu"}
        </button>
      </form>
      <form action={deleteAction} onSubmit={handleDeleteSubmit}>
        <button
          type="submit"
          className="shrink-0 text-zinc-400 hover:text-red-600"
          aria-label="Supprimer ce message"
          title="Supprimer ce message"
        >
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
            <path d="M3 6h18" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
          </svg>
        </button>
      </form>
    </div>
  );
}
