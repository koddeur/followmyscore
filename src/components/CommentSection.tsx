import Link from "next/link";
import { addComment } from "@/app/actions/comments";
import { CommentItem } from "@/components/CommentItem";

export interface CommentData {
  id: string;
  userId: string;
  body: string;
  createdAt: Date;
  user: { name: string; username: string };
}

export function CommentSection({
  matchId,
  matchSlug,
  comments,
  currentUserId,
  isAdmin = false,
}: {
  matchId: string;
  matchSlug: string;
  comments: CommentData[];
  currentUserId: string | null;
  isAdmin?: boolean;
}) {
  const action = addComment.bind(null, matchId);

  return (
    <div className="space-y-4">
      {comments.length === 0 ? (
        <p className="text-sm text-zinc-500">Aucun commentaire pour le moment.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              canEdit={comment.userId === currentUserId}
              canDelete={comment.userId === currentUserId || isAdmin}
            />
          ))}
        </ul>
      )}

      {currentUserId ? (
        <form action={action} className="flex flex-col gap-2 sm:flex-row">
          <input
            name="body"
            required
            maxLength={2000}
            placeholder="Ajouter un commentaire…"
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
          >
            Publier
          </button>
        </form>
      ) : (
        <p className="text-sm text-zinc-500">
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(`/matches/${matchSlug}`)}`}
            className="font-medium text-accent hover:underline"
          >
            Connecte-toi
          </Link>{" "}
          pour laisser un commentaire.
        </p>
      )}
    </div>
  );
}
