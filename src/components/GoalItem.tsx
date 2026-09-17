"use client";

import { useState } from "react";
import { updateGoal, deleteGoal } from "@/app/actions/goals";
import { DeleteEventButton } from "@/components/DeleteEventButton";
import { GoalEventForm } from "@/components/GoalEventForm";
import type { ClubInfo, LineupEntryInfo } from "@/components/PlayerFields";
import type { GoalData } from "@/components/GoalsList";

export function GoalItem({
  goal,
  homeClub,
  awayClub,
  homeLineupEntries,
  awayLineupEntries,
  canEdit,
}: {
  goal: GoalData;
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
        <GoalEventForm
          homeClub={homeClub}
          awayClub={awayClub}
          homeLineupEntries={homeLineupEntries}
          awayLineupEntries={awayLineupEntries}
          initial={{
            clubId: goal.club.id,
            scorerName: goal.scorerName,
            scorerNumber: goal.scorerNumber,
            assistName: goal.assistName,
            assistNumber: null,
            minute: goal.minute,
            ownGoal: goal.ownGoal,
            penalty: goal.penalty,
          }}
          submitLabel="Enregistrer"
          action={updateGoal.bind(null, goal.id)}
          onDone={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <li className="flex items-center gap-2 text-sm">
      <span className="w-10 shrink-0 text-right font-mono text-zinc-500">
        {goal.minute !== null ? `${goal.minute}'` : ""}
      </span>
      <span>⚽</span>
      <span className="font-medium">
        {goal.scorerName ?? <span className="italic text-zinc-400">Buteur non renseigné</span>}
      </span>
      {goal.scorerNumber !== null && <span className="text-zinc-500">#{goal.scorerNumber}</span>}
      <span className="text-zinc-500">({goal.club.name})</span>
      {goal.assistName && <span className="text-zinc-500">passe : {goal.assistName}</span>}
      {goal.ownGoal && (
        <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          csc
        </span>
      )}
      {goal.penalty && (
        <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          pén.
        </span>
      )}
      {canEdit && (
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="shrink-0 text-zinc-400 hover:text-accent"
            aria-label="Modifier ce but"
            title="Modifier ce but"
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
            action={deleteGoal.bind(null, goal.id)}
            confirmMessage="Supprimer ce but ?"
            label="Supprimer ce but"
          />
        </div>
      )}
    </li>
  );
}
