import { followMatch, unfollowMatch } from "@/app/actions/matchFollowers";

export function FollowMatchButton({
  matchId,
  isFollowing,
}: {
  matchId: string;
  isFollowing: boolean;
}) {
  if (isFollowing) {
    return (
      <form action={unfollowMatch.bind(null, matchId)}>
        <button
          type="submit"
          className="rounded-lg border border-border px-3 py-1.5 text-sm text-zinc-500 hover:border-red-400 hover:text-red-600"
        >
          Se retirer
        </button>
      </form>
    );
  }

  return (
    <form action={followMatch.bind(null, matchId)}>
      <button
        type="submit"
        className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
      >
        Devenir éditeur de ce match
      </button>
    </form>
  );
}
