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
