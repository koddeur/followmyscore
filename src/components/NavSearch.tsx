"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { searchAll } from "@/app/actions/search";
import { StatusBadge } from "@/components/StatusBadge";

type SearchResults = Awaited<ReturnType<typeof searchAll>>;

const EMPTY_RESULTS: SearchResults = { clubs: [], matches: [], users: [] };

export function NavSearch({ size = "sm" }: { size?: "sm" | "lg" }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [results, setResults] = useState<SearchResults>(EMPTY_RESULTS);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  const hasResults = results.clubs.length > 0 || results.matches.length > 0 || results.users.length > 0;

  function handleChange(newValue: string) {
    setValue(newValue);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const trimmed = newValue.trim();
    if (!trimmed) {
      requestIdRef.current++;
      setResults(EMPTY_RESULTS);
      setOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    const requestId = ++requestIdRef.current;
    timeoutRef.current = setTimeout(async () => {
      const found = await searchAll(trimmed);
      if (requestId !== requestIdRef.current) return;
      setResults(found);
      setOpen(true);
      setLoading(false);
    }, 300);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function handleSelect() {
    setOpen(false);
    setValue("");
    setResults(EMPTY_RESULTS);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const trimmed = value.trim();
    if (!trimmed) return;

    setOpen(false);
    router.push(`/recherche?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-zinc-400 ${
            size === "lg" ? "left-3.5 h-5 w-5" : "left-2.5 h-4 w-4"
          }`}
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="search"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => {
            if (hasResults) setOpen(true);
          }}
          placeholder="Rechercher un club, un match, un utilisateur…"
          aria-label="Rechercher un club, un match ou un utilisateur"
          className={`w-full rounded-lg border border-border bg-background pr-3 outline-none focus:border-accent ${
            size === "lg" ? "py-3.5 pl-11 text-base" : "py-1.5 pl-8 text-sm"
          }`}
        />
      </form>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-96 overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
          {loading ? (
            <p className="px-3 py-2 text-sm text-zinc-500">Recherche…</p>
          ) : !hasResults ? (
            <p className="px-3 py-2 text-sm text-zinc-500">Aucun résultat.</p>
          ) : (
            <>
              {results.clubs.length > 0 && (
                <div>
                  <p className="px-3 pt-2 text-xs font-medium uppercase text-zinc-400">Clubs</p>
                  <ul>
                    {results.clubs.map((club) => (
                      <li key={club.id}>
                        <Link
                          href={`/clubs/${club.fffId ?? club.id}`}
                          onClick={handleSelect}
                          className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-background"
                        >
                          {club.logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={club.logoUrl}
                              alt=""
                              className="h-6 w-6 shrink-0 rounded-full object-contain"
                            />
                          ) : (
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-background text-[10px] font-semibold text-zinc-400">
                              {club.name.charAt(0)}
                            </span>
                          )}
                          <span className="truncate">{club.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {results.matches.length > 0 && (
                <div>
                  <p className="px-3 pt-2 text-xs font-medium uppercase text-zinc-400">Matchs</p>
                  <ul>
                    {results.matches.map((match) => (
                      <li key={match.id}>
                        <Link
                          href={`/matches/${match.id}`}
                          onClick={handleSelect}
                          className="flex items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-background"
                        >
                          <span className="truncate">
                            {match.homeClub.name} – {match.awayClub.name}
                          </span>
                          <span className="shrink-0">
                            <StatusBadge status={match.status} />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {results.users.length > 0 && (
                <div>
                  <p className="px-3 pt-2 text-xs font-medium uppercase text-zinc-400">Utilisateurs</p>
                  <ul>
                    {results.users.map((user) => (
                      <li key={user.id}>
                        <Link
                          href={`/users/${user.username}`}
                          onClick={handleSelect}
                          className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-background"
                        >
                          {user.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={user.avatarUrl}
                              alt=""
                              className="h-6 w-6 shrink-0 rounded-full object-cover"
                            />
                          ) : (
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-background text-[10px] font-semibold text-zinc-400">
                              {user.name.charAt(0)}
                            </span>
                          )}
                          <span className="truncate">
                            {user.name} <span className="text-zinc-500">@{user.username}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
          {value.trim() && (
            <Link
              href={`/recherche?q=${encodeURIComponent(value.trim())}`}
              onClick={handleSelect}
              className="mt-1 block border-t border-border px-3 py-2 text-center text-sm font-medium text-accent hover:bg-background"
            >
              Voir tous les résultats pour « {value.trim()} »
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
