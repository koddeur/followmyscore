import Link from "next/link";
import {
  STATUS_FILTER_LABELS,
  type MatchStatusFilter,
} from "@/lib/matchStatus";

const FILTERS: MatchStatusFilter[] = ["live", "upcoming", "finished"];

const pillClass = "rounded-full border px-3.5 py-1.5 text-sm font-medium transition";
const activeClass = "border-accent bg-accent text-accent-foreground";
const inactiveClass = "border-border text-zinc-500 hover:border-accent hover:text-foreground";

export function MatchStatusFilter({ active }: { active: MatchStatusFilter | null }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link href="/matches" className={`${pillClass} ${active === null ? activeClass : inactiveClass}`}>
        Tous
      </Link>
      {FILTERS.map((filter) => (
        <Link
          key={filter}
          href={`/matches?status=${filter}`}
          className={`${pillClass} ${active === filter ? activeClass : inactiveClass}`}
        >
          {STATUS_FILTER_LABELS[filter]}
        </Link>
      ))}
    </div>
  );
}
