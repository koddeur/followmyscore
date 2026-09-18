import { GoalItem } from "@/components/GoalItem";
import { sortByMinuteThenCreatedAt } from "@/lib/eventSort";
import type { ClubInfo, LineupEntryInfo } from "@/components/PlayerFields";

export interface GoalData {
  id: string;
  scorerName: string | null;
  scorerNumber: number | null;
  assistName: string | null;
  minute: number | null;
  ownGoal: boolean;
  penalty: boolean;
  createdAt: Date;
  club: { id: string; name: string };
}

export function GoalsList({
  goals,
  homeClub,
  awayClub,
  homeLineupEntries,
  awayLineupEntries,
  canEdit,
}: {
  goals: GoalData[];
  homeClub: ClubInfo;
  awayClub: ClubInfo;
  homeLineupEntries: LineupEntryInfo[];
  awayLineupEntries: LineupEntryInfo[];
  canEdit: boolean;
}) {
  if (goals.length === 0) {
    return <p className="text-sm text-zinc-500">Aucun but pour le moment.</p>;
  }

  const sorted = sortByMinuteThenCreatedAt(goals);

  return (
    <ul className="space-y-0">
      {sorted.map((goal) => (
        <GoalItem
          key={goal.id}
          goal={goal}
          homeClub={homeClub}
          awayClub={awayClub}
          homeLineupEntries={homeLineupEntries}
          awayLineupEntries={awayLineupEntries}
          canEdit={canEdit}
        />
      ))}
    </ul>
  );
}
