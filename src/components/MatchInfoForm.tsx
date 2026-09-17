"use client";

import { useState } from "react";
import { updateMatchInfo } from "@/app/actions/matches";

function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

export interface MatchInfoInitial {
  homeClubName: string;
  awayClubName: string;
  competition: string | null;
  venue: string | null;
  kickoffAt: Date | null;
}

export function MatchInfoForm({
  matchId,
  clubNames,
  initial,
}: {
  matchId: string;
  clubNames: string[];
  initial: MatchInfoInitial;
}) {
  const [editing, setEditing] = useState(false);
  const action = updateMatchInfo.bind(null, matchId);

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="text-xs font-medium text-accent hover:underline"
      >
        Modifier les infos
      </button>
    );
  }

  return (
    <form
      action={action}
      onSubmit={() => setEditing(false)}
      className="mt-3 w-full space-y-3 rounded-lg border border-border bg-background p-3 text-left"
    >
      <datalist id="match-info-club-names">
        {clubNames.map((name, i) => (
          <option key={`${name}-${i}`} value={name} />
        ))}
      </datalist>

      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <label htmlFor="homeClubName" className="mb-1 block text-xs font-medium">
            Équipe domicile
          </label>
          <input
            id="homeClubName"
            name="homeClubName"
            defaultValue={initial.homeClubName}
            required
            list="match-info-club-names"
            className="w-full rounded-lg border border-border bg-card px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label htmlFor="awayClubName" className="mb-1 block text-xs font-medium">
            Équipe extérieur
          </label>
          <input
            id="awayClubName"
            name="awayClubName"
            defaultValue={initial.awayClubName}
            required
            list="match-info-club-names"
            className="w-full rounded-lg border border-border bg-card px-2 py-1.5 text-sm"
          />
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <label htmlFor="competition" className="mb-1 block text-xs font-medium">
            Compétition
          </label>
          <input
            id="competition"
            name="competition"
            defaultValue={initial.competition ?? ""}
            className="w-full rounded-lg border border-border bg-card px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label htmlFor="venue" className="mb-1 block text-xs font-medium">
            Lieu
          </label>
          <input
            id="venue"
            name="venue"
            defaultValue={initial.venue ?? ""}
            className="w-full rounded-lg border border-border bg-card px-2 py-1.5 text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="kickoffAt" className="mb-1 block text-xs font-medium">
          Coup d&apos;envoi
        </label>
        <input
          id="kickoffAt"
          name="kickoffAt"
          type="datetime-local"
          defaultValue={initial.kickoffAt ? toDatetimeLocal(initial.kickoffAt) : ""}
          className="w-full rounded-lg border border-border bg-card px-2 py-1.5 text-sm sm:w-64"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-accent-foreground hover:opacity-90"
        >
          Enregistrer
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-lg border border-border px-3 py-1.5 text-sm hover:border-accent"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
