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
import { findRecentSubstitution } from "@/app/actions/substitutions";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export interface SubstitutionFormValues {
  clubId: string;
  playerInName: string | null;
  playerInNumber: number | null;
  playerOutName: string | null;
  playerOutNumber: number | null;
  minute: number | null;
}

export function SubstitutionEventForm({
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
  initial?: SubstitutionFormValues;
  submitLabel: string;
  action: (formData: FormData) => void;
  onDone: () => void;
}) {
  const [clubId, setClubId] = useState(initial?.clubId ?? homeClub.id);
  const entries = clubId === homeClub.id ? homeLineupEntries : awayLineupEntries;

  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const [duplicateMessage, setDuplicateMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    // Only warn on brand-new substitutions — editing an existing one isn't a duplicate.
    if (!initial && matchId) {
      const recent = await findRecentSubstitution(matchId, clubId);
      if (recent) {
        const who = recent.playerInName ? ` (${recent.playerInName})` : "";
        setDuplicateMessage(
          `Un changement${who} a déjà été ajouté pour ce club il y a ${recent.secondsAgo} s. L'ajouter quand même ?`
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
          legend="Entre (optionnel)"
          entries={entries}
          nameField="playerInName"
          numberField="playerInNumber"
          initialName={initial?.playerInName ?? ""}
          initialNumber={initial?.playerInNumber != null ? String(initial.playerInNumber) : ""}
        />

        <PlayerFields
          legend="Sort (optionnel)"
          entries={entries}
          nameField="playerOutName"
          numberField="playerOutNumber"
          initialName={initial?.playerOutName ?? ""}
          initialNumber={initial?.playerOutNumber != null ? String(initial.playerOutNumber) : ""}
        />

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
