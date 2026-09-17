"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { deleteComment } from "@/app/actions/comments";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export function DeleteCommentButton({
  commentId,
  matchId,
}: {
  commentId: string;
  matchId: string;
}) {
  const action = deleteComment.bind(null, commentId, matchId);
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
        message="Supprimer ce commentaire ?"
        onConfirm={handleConfirm}
        onCancel={() => setConfirming(false)}
        confirmLabel="Supprimer"
      />
      <form action={action} onSubmit={handleSubmit}>
        <button
          type="submit"
          className="shrink-0 text-zinc-400 hover:text-red-600"
          aria-label="Supprimer ce commentaire"
          title="Supprimer ce commentaire"
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
    </>
  );
}
