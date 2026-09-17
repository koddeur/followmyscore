"use client";

import { useActionState } from "react";
import { createMatch } from "@/app/actions/matches";

export function CreateMatchForm({ clubNames }: { clubNames: string[] }) {
  const [state, action, pending] = useActionState(createMatch, undefined);

  return (
    <form action={action} className="space-y-4">
      <datalist id="club-names">
        {clubNames.map((name, i) => (
          <option key={`${name}-${i}`} value={name} />
        ))}
      </datalist>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="homeClubName" className="mb-1 block text-sm font-medium">
            Équipe domicile
          </label>
          <input
            id="homeClubName"
            name="homeClubName"
            required
            list="club-names"
            placeholder="ex : AS Villeneuve"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <div>
          <label htmlFor="awayClubName" className="mb-1 block text-sm font-medium">
            Équipe extérieur
          </label>
          <input
            id="awayClubName"
            name="awayClubName"
            required
            list="club-names"
            placeholder="ex : FC Lagny"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="competition" className="mb-1 block text-sm font-medium">
            Compétition (optionnel)
          </label>
          <input
            id="competition"
            name="competition"
            placeholder="ex : Coupe départementale"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <div>
          <label htmlFor="venue" className="mb-1 block text-sm font-medium">
            Lieu (optionnel)
          </label>
          <input
            id="venue"
            name="venue"
            placeholder="ex : Stade municipal"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
      </div>

      <div>
        <label htmlFor="kickoffAt" className="mb-1 block text-sm font-medium">
          Coup d&apos;envoi (optionnel)
        </label>
        <input
          id="kickoffAt"
          name="kickoffAt"
          type="datetime-local"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent sm:w-64"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Création…" : "Créer le match"}
      </button>
    </form>
  );
}
