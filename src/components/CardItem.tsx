"use client";

import { useState } from "react";
import { updateCard, deleteCard } from "@/app/actions/cards";
import { DeleteEventButton } from "@/components/DeleteEventButton";
import { CardEventForm } from "@/components/CardEventForm";
import type { ClubInfo, LineupEntryInfo } from "@/components/PlayerFields";
import type { CardData } from "@/components/CardsList";

export function CardItem({
  card,
  homeClub,
  awayClub,
  homeLineupEntries,
  awayLineupEntries,
  canEdit,
}: {
  card: CardData;
  homeClub: ClubInfo;
  awayClub: ClubInfo;
  homeLineupEntries: LineupEntryInfo[];
  awayLineupEntries: LineupEntryInfo[];
  canEdit: boolean;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li>
        <CardEventForm
          homeClub={homeClub}
          awayClub={awayClub}
          homeLineupEntries={homeLineupEntries}
          awayLineupEntries={awayLineupEntries}
          initial={{
            clubId: card.club.id,
            playerName: card.playerName,
            playerNumber: card.number,
            minute: card.minute,
            type: card.type,
          }}
          submitLabel="Enregistrer"
          action={updateCard.bind(null, card.id)}
          onDone={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <li className="flex items-center gap-2 text-sm">
      <span className="w-10 shrink-0 text-right font-mono text-zinc-500">
        {card.minute !== null ? `${card.minute}'` : ""}
      </span>
      <span>{card.type === "YELLOW" ? "🟨" : "🟥"}</span>
      <span className="font-medium">
        {card.playerName ?? <span className="italic text-zinc-400">Joueur non renseigné</span>}
      </span>
      {card.number !== null && <span className="text-zinc-500">#{card.number}</span>}
      <span className="text-zinc-500">({card.club.name})</span>
      {canEdit && (
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="shrink-0 text-zinc-400 hover:text-accent"
            aria-label="Modifier ce carton"
            title="Modifier ce carton"
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
          <DeleteEventButton
            action={deleteCard.bind(null, card.id)}
            confirmMessage="Supprimer ce carton ?"
            label="Supprimer ce carton"
          />
        </div>
      )}
    </li>
  );
}
