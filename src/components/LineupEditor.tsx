"use client";

import { useState } from "react";
import { saveLineup } from "@/app/actions/lineups";

const SUBSTITUTE = "Remplaçant";

interface Row {
  playerName: string;
  number: string;
  position: string;
}

export interface LineupInitial {
  formation: string | null;
  entries: { playerName: string; number: number | null; position: string | null; isStarting: boolean }[];
}

function emptyRow(): Row {
  return { playerName: "", number: "", position: "Gardien" };
}

export function LineupEditor({
  matchId,
  clubId,
  clubName,
  initial,
}: {
  matchId: string;
  clubId: string;
  clubName: string;
  initial: LineupInitial | null;
}) {
  const [rows, setRows] = useState<Row[]>(
    initial && initial.entries.length > 0
      ? initial.entries.map((e) => ({
          playerName: e.playerName,
          number: e.number?.toString() ?? "",
          position: e.isStarting ? e.position || "Gardien" : SUBSTITUTE,
        }))
      : [emptyRow()]
  );

  function updateRow(index: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function addRow() {
    setRows((prev) => [...prev, emptyRow()]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  // Derived on every render from `rows`, so the hidden field is always in
  // sync with the latest keystroke by the time the form actually submits.
  const entriesJson = JSON.stringify(
    rows
      .filter((row) => row.playerName.trim().length > 0)
      .map((row) => ({
        playerName: row.playerName.trim(),
        number: row.number ? Number(row.number) : undefined,
        position: row.position === SUBSTITUTE ? undefined : row.position,
        isStarting: row.position !== SUBSTITUTE,
      }))
  );

  const action = saveLineup.bind(null, matchId, clubId);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="entries" value={entriesJson} readOnly />
      <label className="text-sm font-medium">{clubName}</label>

      <div className="space-y-1.5">
        {rows.map((row, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <input
              value={row.number}
              onChange={(e) => updateRow(index, { number: e.target.value })}
              placeholder="N°"
              type="number"
              className="w-14 rounded-lg border border-border bg-background px-2 py-1 text-sm"
            />
            <input
              value={row.playerName}
              onChange={(e) => updateRow(index, { playerName: e.target.value })}
              placeholder="Nom du joueur"
              className="flex-1 rounded-lg border border-border bg-background px-2 py-1 text-sm"
            />
            <select
              value={row.position}
              onChange={(e) => updateRow(index, { position: e.target.value })}
              className="w-28 rounded-lg border border-border bg-background px-2 py-1 text-sm"
            >
              <option value="Gardien">Gardien</option>
              <option value="Défenseur">Défenseur</option>
              <option value="Milieu">Milieu</option>
              <option value="Attaquant">Attaquant</option>
              <option value={SUBSTITUTE}>{SUBSTITUTE}</option>
            </select>
            <button
              type="button"
              onClick={() => removeRow(index)}
              className="text-zinc-400 hover:text-red-600"
              aria-label="Retirer"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={addRow}
          className="rounded-lg border border-border px-3 py-1.5 text-sm hover:border-accent"
        >
          + Ajouter un joueur
        </button>
        <button
          type="submit"
          className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-accent-foreground hover:opacity-90"
        >
          Enregistrer la composition
        </button>
      </div>
    </form>
  );
}
