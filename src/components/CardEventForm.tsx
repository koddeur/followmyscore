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
import { findRecentCard } from "@/app/actions/cards";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export interface CardFormValues {
  clubId: string;
  playerName: string | null;
  playerNumber: number | null;
  minute: number | null;
  type: "YELLOW" | "RED";
}

export function CardEventForm({
  matchId,
  cardType,
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
  cardType?: "YELLOW" | "RED";
  homeClub: ClubInfo;
  awayClub: ClubInfo;
  homeLineupEntries: LineupEntryInfo[];
  awayLineupEntries: LineupEntryInfo[];
  initial?: CardFormValues;
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

    // Only warn on brand-new cards — editing an existing one isn't a duplicate.
    if (!initial && matchId && cardType) {
      const recent = await findRecentCard(matchId, clubId, cardType);
      if (recent) {
        const label = cardType === "YELLOW" ? "jaune" : "rouge";
        const who = recent.playerName ? ` pour ${recent.playerName}` : "";
        setDuplicateMessage(
          `Un carton ${label}${who} a déjà été ajouté il y a ${recent.secondsAgo} s. L'ajouter quand même ?`
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
      <form action={action} onSubmit={handleSubmit} className="space-y-3">
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
          {initial && (
            <select name="type" defaultValue={initial.type} className={inputClass}>
              <option value="YELLOW">Jaune</option>
              <option value="RED">Rouge</option>
            </select>
          )}
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
          legend="Joueur (optionnel)"
          entries={entries}
          nameField="playerName"
          numberField="playerNumber"
          initialName={initial?.playerName ?? ""}
          initialNumber={initial?.playerNumber != null ? String(initial.playerNumber) : ""}
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
