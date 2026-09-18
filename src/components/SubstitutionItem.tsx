"use client";

import { useState } from "react";
import { updateSubstitution, deleteSubstitution } from "@/app/actions/substitutions";
import { DeleteEventButton } from "@/components/DeleteEventButton";
import { SubstitutionEventForm } from "@/components/SubstitutionEventForm";
import { RecentEventHighlight } from "@/components/RecentEventHighlight";
import { SubstitutionIcon } from "@/components/MatchEventIcons";
import type { ClubInfo, LineupEntryInfo } from "@/components/PlayerFields";
import type { SubstitutionData } from "@/components/SubstitutionsList";

export function SubstitutionItem({
  substitution,
  homeClub,
  awayClub,
  homeLineupEntries,
  awayLineupEntries,
  canEdit,
}: {
  substitution: SubstitutionData;
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
        <SubstitutionEventForm
          homeClub={homeClub}
          awayClub={awayClub}
          homeLineupEntries={homeLineupEntries}
          awayLineupEntries={awayLineupEntries}
          initial={{
            clubId: substitution.club.id,
            playerInName: substitution.playerInName,
            playerInNumber: substitution.playerInNumber,
            playerOutName: substitution.playerOutName,
            playerOutNumber: substitution.playerOutNumber,
            minute: substitution.minute,
          }}
          submitLabel="Enregistrer"
          action={updateSubstitution.bind(null, substitution.id)}
          onDone={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <li>
      <RecentEventHighlight createdAt={substitution.createdAt} className="rounded-lg border p-1.5">
        <div className="flex items-center gap-2 text-sm">
          <span className="w-10 shrink-0 text-right font-mono text-zinc-500">
            {substitution.minute !== null ? `${substitution.minute}'` : ""}
          </span>
          <SubstitutionIcon className="h-4 w-4 shrink-0" />
          <span className="font-medium">
            {substitution.playerInName ?? <span className="italic text-zinc-400">Changement</span>}
          </span>
          {substitution.playerInNumber !== null && (
            <span className="text-zinc-500">#{substitution.playerInNumber}</span>
          )}
          {(substitution.playerOutName || substitution.playerOutNumber !== null) && (
            <span className="text-zinc-500">
              à la place de {substitution.playerOutName ?? `#${substitution.playerOutNumber}`}
              {substitution.playerOutName &&
                substitution.playerOutNumber !== null &&
                ` #${substitution.playerOutNumber}`}
            </span>
          )}
          <span className="text-zinc-500">({substitution.club.name})</span>
          {canEdit && (
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="shrink-0 text-zinc-400 hover:text-accent"
                aria-label="Modifier ce changement"
                title="Modifier ce changement"
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
                action={deleteSubstitution.bind(null, substitution.id)}
                confirmMessage="Supprimer ce changement ?"
                label="Supprimer ce changement"
              />
            </div>
          )}
        </div>
      </RecentEventHighlight>
    </li>
  );
}
