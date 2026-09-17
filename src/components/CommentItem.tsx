"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { updateComment } from "@/app/actions/comments";
import { DeleteCommentButton } from "@/components/DeleteCommentButton";
import type { CommentData } from "@/components/CommentSection";

export function CommentItem({
  comment,
  matchId,
  canEdit,
  canDelete,
}: {
  comment: CommentData;
  matchId: string;
  canEdit: boolean;
  canDelete: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const action = updateComment.bind(null, comment.id, matchId);

  if (editing) {
    return (
      <li className="rounded-lg bg-background p-3 text-sm">
        <form
          action={action}
          onSubmit={() => setEditing(false)}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <input
            name="body"
            required
            maxLength={2000}
            defaultValue={comment.body}
            className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
            >
              Enregistrer
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg border border-border px-3 py-2 text-sm hover:border-accent"
            >
              Annuler
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="rounded-lg bg-background p-3 text-sm">
      <div className="flex items-start justify-between gap-3">
        <p>{comment.body}</p>
        {(canEdit || canDelete) && (
          <div className="flex shrink-0 items-center gap-2">
            {canEdit && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-zinc-400 hover:text-accent"
                aria-label="Modifier ce commentaire"
                title="Modifier ce commentaire"
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
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              </button>
            )}
            {canDelete && <DeleteCommentButton commentId={comment.id} matchId={matchId} />}
          </div>
        )}
      </div>
      <p className="mt-1 text-xs text-zinc-500">
        <Link
          href={`/users/${comment.user.username}`}
          className="font-medium hover:text-accent hover:underline"
        >
          {comment.user.name}
        </Link>{" "}
        · {format(comment.createdAt, "d MMM 'à' HH:mm", { locale: fr })}
      </p>
    </li>
  );
}
