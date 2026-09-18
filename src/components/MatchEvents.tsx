"use client";

import { useState } from "react";
import { startMatch, endMatch, updateStatus } from "@/app/actions/matches";
import { addGoal } from "@/app/actions/goals";
import { addCard } from "@/app/actions/cards";
import { addSubstitution } from "@/app/actions/substitutions";
import { buttonClass, primaryButtonClass, inputClass, type ClubInfo, type LineupEntryInfo } from "@/components/PlayerFields";
import { GoalEventForm } from "@/components/GoalEventForm";
import { CardEventForm } from "@/components/CardEventForm";
import { SubstitutionEventForm } from "@/components/SubstitutionEventForm";
import { GoalIcon, CardIcon, SubstitutionIcon } from "@/components/MatchEventIcons";
import { Modal } from "@/components/Modal";

type EventKind = "start" | "end" | "goal" | "yellow" | "red" | "substitution";

const TILE_BASE =
  "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition hover:shadow-sm";

const TILE_COLORS: Record<EventKind | "halftime", string> = {
  start: "border-accent/30 bg-accent/10 text-accent hover:bg-accent/20",
  end: "border-zinc-300 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  halftime:
    "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
  goal: "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  yellow:
    "border-yellow-300 bg-yellow-50 text-yellow-800 hover:bg-yellow-100 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
  red: "border-red-300 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
  substitution:
    "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
};

function tileClass(color: keyof typeof TILE_COLORS, active: boolean) {
  return `${TILE_BASE} ${TILE_COLORS[color]} ${active ? "ring-2 ring-accent ring-offset-1 ring-offset-card" : ""}`;
}

function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

function TimeForm({
  label,
  fieldName,
  action,
  onDone,
}: {
  label: string;
  fieldName: string;
  action: (formData: FormData) => void;
  onDone: () => void;
}) {
  return (
    <form action={action} onSubmit={onDone} className="flex flex-wrap items-center gap-2">
      <label className="text-sm font-medium">{label}</label>
      <input
        type="datetime-local"
        name={fieldName}
        defaultValue={toDatetimeLocal(new Date())}
        required
        className={inputClass}
      />
      <button type="submit" className={primaryButtonClass}>
        Confirmer
      </button>
      <button type="button" onClick={onDone} className={buttonClass}>
        Annuler
      </button>
    </form>
  );
}

export function MatchEvents({
  matchId,
  homeClub,
  awayClub,
  homeLineupEntries,
  awayLineupEntries,
  started,
  ended,
  isHalftime,
}: {
  matchId: string;
  homeClub: ClubInfo;
  awayClub: ClubInfo;
  homeLineupEntries: LineupEntryInfo[];
  awayLineupEntries: LineupEntryInfo[];
  started: boolean;
  ended: boolean;
  isHalftime: boolean;
}) {
  const [open, setOpen] = useState<EventKind | null>(null);
  const close = () => setOpen(null);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        {!started && (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setOpen("start")} className={tileClass("start", open === "start")}>
              <span className="text-lg">▶️</span>
              Démarrer le match
            </button>
          </div>
        )}
        {started && !ended && (
          <>
            <div className="flex flex-wrap gap-2">
              <form action={updateStatus.bind(null, matchId)}>
                <input type="hidden" name="status" value={isHalftime ? "LIVE" : "HALFTIME"} />
                <button type="submit" className={tileClass("halftime", false)}>
                  <span className="text-lg">{isHalftime ? "▶️" : "⏸️"}</span>
                  {isHalftime ? "Reprise 2ème période" : "Mi-temps"}
                </button>
              </form>
              <button type="button" onClick={() => setOpen("end")} className={tileClass("end", open === "end")}>
                <span className="text-lg">⏹️</span>
                Terminer le match
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setOpen("goal")} className={tileClass("goal", open === "goal")}>
                <GoalIcon className="h-5 w-5 text-accent" />
                But
              </button>
              <button
                type="button"
                onClick={() => setOpen("yellow")}
                className={tileClass("yellow", open === "yellow")}
              >
                <CardIcon type="YELLOW" className="h-4 w-4" />
                Carton jaune
              </button>
              <button type="button" onClick={() => setOpen("red")} className={tileClass("red", open === "red")}>
                <CardIcon type="RED" className="h-4 w-4" />
                Carton rouge
              </button>
              <button
                type="button"
                onClick={() => setOpen("substitution")}
                className={tileClass("substitution", open === "substitution")}
              >
                <SubstitutionIcon className="h-5 w-5" />
                Changement
              </button>
            </div>
          </>
        )}
        {ended && <p className="text-sm text-zinc-500">Match terminé.</p>}
      </div>

      <Modal open={open === "start"} onClose={close} title="Heure de début">
        <TimeForm label="Heure de début" fieldName="startedAt" action={startMatch.bind(null, matchId)} onDone={close} />
      </Modal>

      <Modal open={open === "end"} onClose={close} title="Heure de fin">
        <TimeForm label="Heure de fin" fieldName="endedAt" action={endMatch.bind(null, matchId)} onDone={close} />
      </Modal>

      <Modal open={open === "goal"} onClose={close} title="Ajouter un but">
        <GoalEventForm
          matchId={matchId}
          homeClub={homeClub}
          awayClub={awayClub}
          homeLineupEntries={homeLineupEntries}
          awayLineupEntries={awayLineupEntries}
          submitLabel="Ajouter le but"
          action={addGoal.bind(null, matchId)}
          onDone={close}
        />
      </Modal>

      <Modal
        open={open === "yellow" || open === "red"}
        onClose={close}
        title={open === "yellow" ? "Ajouter un carton jaune" : "Ajouter un carton rouge"}
      >
        <CardEventForm
          matchId={matchId}
          cardType={open === "yellow" ? "YELLOW" : "RED"}
          homeClub={homeClub}
          awayClub={awayClub}
          homeLineupEntries={homeLineupEntries}
          awayLineupEntries={awayLineupEntries}
          submitLabel="Ajouter le carton"
          action={addCard.bind(null, matchId, open === "yellow" ? "YELLOW" : "RED")}
          onDone={close}
        />
      </Modal>

      <Modal open={open === "substitution"} onClose={close} title="Ajouter un changement">
        <SubstitutionEventForm
          matchId={matchId}
          homeClub={homeClub}
          awayClub={awayClub}
          homeLineupEntries={homeLineupEntries}
          awayLineupEntries={awayLineupEntries}
          submitLabel="Ajouter le changement"
          action={addSubstitution.bind(null, matchId)}
          onDone={close}
        />
      </Modal>
    </div>
  );
}
