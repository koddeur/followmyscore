import Link from "next/link";

export type SearchType = "clubs" | "matches" | "users";

const FILTERS: { value: SearchType; label: string }[] = [
  { value: "clubs", label: "Clubs" },
  { value: "matches", label: "Matchs" },
  { value: "users", label: "Utilisateurs" },
];

const pillClass = "rounded-full border px-3.5 py-1.5 text-sm font-medium transition";
const activeClass = "border-accent bg-accent text-accent-foreground";
const inactiveClass = "border-border text-zinc-500 hover:border-accent hover:text-foreground";

export function SearchTypeFilter({ query, active }: { query: string; active: SearchType | null }) {
  function href(type?: SearchType) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (type) params.set("type", type);
    const qs = params.toString();
    return qs ? `/recherche?${qs}` : "/recherche";
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link href={href()} className={`${pillClass} ${active === null ? activeClass : inactiveClass}`}>
        Tous
      </Link>
      {FILTERS.map((filter) => (
        <Link
          key={filter.value}
          href={href(filter.value)}
          className={`${pillClass} ${active === filter.value ? activeClass : inactiveClass}`}
        >
          {filter.label}
        </Link>
      ))}
    </div>
  );
}

export function isSearchType(value: string): value is SearchType {
  return value === "clubs" || value === "matches" || value === "users";
}
