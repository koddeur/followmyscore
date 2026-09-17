"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import {
  PlayerFields,
  buttonClass,
  primaryButtonClass,
  inputClass,
  type ClubInfo,
  type LineupEntryInfo,
} from "@/components/PlayerFields";
import { findRecentGoal } from "@/app/actions/goals";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export interface GoalFormValues {
  clubId: string;
  scorerName: string | null;
  scorerNumber: number | null;
  assistName: string | null;
  assistNumber: number | null;
  minute: number | null;
  ownGoal: boolean;
  penalty: boolean;
}

export function GoalEventForm({
  matchId,
  homeClub,
  awayClub,
  homeLineupEntries,
  awayLineupEntries,
  initial,
  submitLabel,
  action,
  onDone,
}: {
  matchId?: string;
  homeClub: ClubInfo;
  awayClub: ClubInfo;
  homeLineupEntries: LineupEntryInfo[];
  awayLineupEntries: LineupEntryInfo[];
  initial?: GoalFormValues;
  submitLabel: string;
  action: (formData: FormData) => void;
  onDone: () => void;
}) {
  const [clubId, setClubId] = useState(initial?.clubId ?? homeClub.id);
  const [ownGoal, setOwnGoal] = useState(initial?.ownGoal ?? false);
  const entries = clubId === homeClub.id ? homeLineupEntries : awayLineupEntries;

  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const [duplicateMessage, setDuplicateMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    // Only warn on brand-new goals — editing an existing one isn't a duplicate.
    if (!initial && matchId) {
      const recent = await findRecentGoal(matchId, clubId);
      if (recent) {
        const who = recent.scorerName ? ` (${recent.scorerName})` : "";
        setDuplicateMessage(
          `Un but${who} a déjà été ajouté pour ce club il y a ${recent.secondsAgo} s. L'ajouter quand même ?`
        );
        setPendingFormData(formData);
        return;
      }
    }

    onDone();
    action(formData);
  }

  function confirmDuplicate() {
    if (pendingFormData) {
      onDone();
      action(pendingFormData);
    }
    setPendingFormData(null);
    setDuplicateMessage(null);
  }

  function cancelDuplicate() {
    setPendingFormData(null);
    setDuplicateMessage(null);
  }

  return (
    <>
      <ConfirmDialog
        open={duplicateMessage !== null}
        message={duplicateMessage ?? ""}
        onConfirm={confirmDuplicate}
        onCancel={cancelDuplicate}
      />
      <form
        action={action}
        onSubmit={handleSubmit}
        className="mt-3 space-y-3 rounded-lg border border-border bg-background p-3"
      >
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Club</label>
          <select
            name="clubId"
            value={clubId}
            onChange={(e) => setClubId(e.target.value)}
            className={inputClass}
          >
            <option value={homeClub.id}>{homeClub.name}</option>
            <option value={awayClub.id}>{awayClub.name}</option>
          </select>
          <input
            name="minute"
            type="number"
            min={0}
            max={130}
            defaultValue={initial?.minute ?? ""}
            placeholder="Min."
            className={`${inputClass} w-20`}
          />
        </div>

        <PlayerFields
          legend="Buteur (optionnel)"
          entries={entries}
          nameField="scorerName"
          numberField="scorerNumber"
          initialName={initial?.scorerName ?? ""}
          initialNumber={initial?.scorerNumber != null ? String(initial.scorerNumber) : ""}
        />

        <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              name="ownGoal"
              checked={ownGoal}
              onChange={(e) => setOwnGoal(e.target.checked)}
            />
            Contre son camp
          </label>
          <label className="flex items-center gap-1.5">
            <input type="checkbox" name="penalty" defaultChecked={initial?.penalty ?? false} /> Pénalty
          </label>
        </div>

        {!ownGoal && (
          <PlayerFields
            legend="Passeur décisif (optionnel)"
            entries={entries}
            nameField="assistName"
            numberField="assistNumber"
            initialName={initial?.assistName ?? ""}
            initialNumber={initial?.assistNumber != null ? String(initial.assistNumber) : ""}
          />
        )}

        <div className="flex items-center gap-2">
          <button type="submit" className={primaryButtonClass}>
            {submitLabel}
          </button>
          <button type="button" onClick={onDone} className={buttonClass}>
            Annuler
          </button>
        </div>
      </form>
    </>
  );
}
