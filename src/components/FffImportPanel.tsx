"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  searchFffClubs,
  lookupFffCategories,
  lookupFffMatches,
  importFffMatch,
  type FffClubOption,
  type FffMatchOption,
} from "@/app/actions/fffImport";
import type { FffTeamOption } from "@/lib/fff";
import { ClubLogo } from "@/components/ClubLogo";

type Step = "club" | "category" | "match";

const itemButtonClass =
  "flex w-full items-center gap-3 p-3 text-left text-sm hover:bg-background";

export function FffImportPanel() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("club");
  const [query, setQuery] = useState("");
  const [clubs, setClubs] = useState<FffClubOption[]>([]);
  const [selectedClub, setSelectedClub] = useState<FffClubOption | null>(null);
  const [categories, setCategories] = useState<FffTeamOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<FffTeamOption | null>(null);
  const [matches, setMatches] = useState<FffMatchOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importingId, setImportingId] = useState<string | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleQueryChange(value: string) {
    setQuery(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (value.trim().length < 2) {
      setClubs([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      const results = await searchFffClubs(value);
      setLoading(false);
      setClubs(results);
    }, 300);
  }

  async function handleSelectClub(club: FffClubOption) {
    setSelectedClub(club);
    setStep("category");
    setCategories([]);
    setLoading(true);
    setError(null);

    const result = await lookupFffCategories(club.fffId);
    setLoading(false);

    if (!result) {
      setError("Impossible de récupérer les équipes de ce club depuis la FFF.");
      return;
    }
    if (result.length === 0) {
      setError("Aucune équipe trouvée pour ce club.");
      return;
    }
    setCategories(result);
  }

  async function handleSelectCategory(category: FffTeamOption) {
    if (!selectedClub) return;
    setSelectedCategory(category);
    setStep("match");
    setMatches([]);
    setLoading(true);
    setError(null);

    const result = await lookupFffMatches(selectedClub.fffId, String(category.number));
    setLoading(false);

    if (!result) {
      setError("Impossible de récupérer les matchs de cette équipe depuis la FFF.");
      return;
    }
    if (result.length === 0) {
      setError("Aucun match à venir trouvé pour cette équipe.");
      return;
    }
    setMatches(result);
  }

  async function handleImport(summary: FffMatchOption) {
    setImportingId(summary.fffId);
    setError(null);
    const result = await importFffMatch(summary);
    if ("error" in result) {
      setError(result.error);
      setImportingId(null);
      return;
    }
    router.push(`/matches/${result.matchId}`);
  }

  function reset() {
    setStep("club");
    setQuery("");
    setClubs([]);
    setSelectedClub(null);
    setCategories([]);
    setSelectedCategory(null);
    setMatches([]);
    setError(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
        <span className={step === "club" ? "font-semibold text-foreground" : undefined}>1. Club</span>
        <span>→</span>
        <span className={step === "category" ? "font-semibold text-foreground" : undefined}>
          2. Catégorie
        </span>
        <span>→</span>
        <span className={step === "match" ? "font-semibold text-foreground" : undefined}>3. Match</span>
        {step !== "club" && (
          <button type="button" onClick={reset} className="ml-auto text-accent hover:underline">
            Recommencer
          </button>
        )}
      </div>

      {step === "club" && (
        <div className="space-y-3">
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Rechercher un club par son nom…"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
          {clubs.length > 0 && (
            <ul className="divide-y divide-border rounded-xl border border-border">
              {clubs.map((club) => (
                <li key={club.id}>
                  <button type="button" onClick={() => handleSelectClub(club)} className={itemButtonClass}>
                    {club.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={club.logoUrl} alt="" className="h-8 w-8 shrink-0 rounded-full object-contain" />
                    ) : (
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background text-xs font-semibold text-zinc-400">
                        {club.name.charAt(0)}
                      </span>
                    )}
                    <span className="font-medium">{club.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {step === "category" && selectedClub && (
        <div className="space-y-3">
          <p className="text-sm">
            Club : <span className="font-medium">{selectedClub.name}</span>
          </p>
          {categories.length > 0 && (
            <ul className="divide-y divide-border rounded-xl border border-border">
              {categories.map((cat) => (
                <li key={cat.number}>
                  <button
                    type="button"
                    onClick={() => handleSelectCategory(cat)}
                    className={`${itemButtonClass} justify-between`}
                  >
                    <span className="font-medium">{cat.competitionName}</span>
                    <span className="text-xs text-zinc-500">Équipe n°{cat.number}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {step === "match" && selectedClub && selectedCategory && (
        <div className="space-y-3">
          <p className="text-sm">
            <span className="font-medium">{selectedClub.name}</span> —{" "}
            <span className="font-medium">{selectedCategory.competitionName}</span>
          </p>
          {matches.length > 0 && (
            <ul className="divide-y divide-border rounded-xl border border-border">
              {matches.map((match) => (
                <li key={match.fffId} className="flex items-start justify-between gap-3 p-3 text-sm">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex shrink-0 items-center gap-1">
                      <ClubLogo logoUrl={match.homeClubLogoUrl} name={match.homeClubName} className="h-6 w-6" />
                      <ClubLogo logoUrl={match.awayClubLogoUrl} name={match.awayClubName} className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {match.homeClubName} – {match.awayClubName}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {match.competition}
                        {match.kickoffAt &&
                          ` · ${format(new Date(match.kickoffAt), "d MMM yyyy 'à' HH:mm", {
                            locale: fr,
                          })}`}
                      </p>
                      {match.venue && <p className="text-xs text-zinc-500">{match.venue}</p>}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleImport(match)}
                    disabled={importingId === match.fffId}
                    className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:border-accent disabled:opacity-60"
                  >
                    {importingId === match.fffId ? "Import…" : "Importer"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {loading && <p className="text-sm text-zinc-500">Chargement…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
