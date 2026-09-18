import type { MatchStatus } from "../../generated/prisma/enums";

export const STATUS_PRIORITY: Record<MatchStatus, number> = {
  LIVE: 0,
  HALFTIME: 0,
  INTERRUPTED: 0,
  SCHEDULED: 1,
  FINISHED: 2,
  POSTPONED: 3,
  CANCELLED: 4,
};

export type MatchStatusFilter = "live" | "upcoming" | "finished";

export const STATUS_FILTER_GROUPS: Record<MatchStatusFilter, MatchStatus[]> = {
  live: ["LIVE", "HALFTIME", "INTERRUPTED"],
  upcoming: ["SCHEDULED"],
  finished: ["FINISHED"],
};

export const STATUS_FILTER_LABELS: Record<MatchStatusFilter, string> = {
  live: "En cours",
  upcoming: "À venir",
  finished: "Terminés",
};

export function isMatchStatusFilter(value: string): value is MatchStatusFilter {
  return value === "live" || value === "upcoming" || value === "finished";
}
