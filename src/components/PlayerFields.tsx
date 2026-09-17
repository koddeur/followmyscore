"use client";

import { useState } from "react";

export interface ClubInfo {
  id: string;
  name: string;
}

export interface LineupEntryInfo {
  playerName: string;
  number: number | null;
}

export const buttonClass =
  "rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:border-accent";
export const primaryButtonClass =
  "rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-accent-foreground hover:opacity-90";
export const inputClass = "rounded-lg border border-border bg-background px-2 py-1.5 text-sm";

export function PlayerFields({
  legend,
  entries,
  nameField,
  numberField,
  initialName = "",
  initialNumber = "",
  required = false,
}: {
  legend: string;
  entries: LineupEntryInfo[];
  nameField: string;
  numberField: string;
  initialName?: string;
  initialNumber?: string;
  required?: boolean;
}) {
  const [name, setName] = useState(initialName);
  const [number, setNumber] = useState(initialNumber);

  function pickFromLineup(value: string) {
    const idx = Number(value);
    if (Number.isNaN(idx) || idx < 0) return;
    const entry = entries[idx];
    if (!entry) return;
    setName(entry.playerName);
    setNumber(entry.number !== null ? entry.number.toString() : "");
  }

  return (
    <div className="grid gap-1.5 sm:grid-cols-[1fr_1fr_5rem]">
      <label className="text-xs text-zinc-500 sm:col-span-3">{legend}</label>
      {entries.length > 0 && (
        <select
          onChange={(e) => pickFromLineup(e.target.value)}
          defaultValue="-1"
          className={inputClass}
        >
          <option value="-1">Choisir dans la compo…</option>
          {entries.map((entry, i) => (
            <option key={i} value={i}>
              {entry.number !== null ? `${entry.number} — ` : ""}
              {entry.playerName}
            </option>
          ))}
        </select>
      )}
      <input
        name={nameField}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nom du joueur"
        required={required}
        className={inputClass}
      />
      <input
        name={numberField}
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        type="number"
        min={0}
        max={99}
        placeholder="N°"
        className={inputClass}
      />
    </div>
  );
}
