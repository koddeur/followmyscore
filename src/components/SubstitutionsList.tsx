import { SubstitutionItem } from "@/components/SubstitutionItem";
import type { ClubInfo, LineupEntryInfo } from "@/components/PlayerFields";

export interface SubstitutionData {
  id: string;
  playerInName: string | null;
  playerInNumber: number | null;
  playerOutName: string | null;
  playerOutNumber: number | null;
  minute: number | null;
  club: { id: string; name: string };
}

export function SubstitutionsList({
  substitutions,
  homeClub,
  awayClub,
  homeLineupEntries,
  awayLineupEntries,
  canEdit,
}: {
  substitutions: SubstitutionData[];
  homeClub: ClubInfo;
  awayClub: ClubInfo;
  homeLineupEntries: LineupEntryInfo[];
  awayLineupEntries: LineupEntryInfo[];
  canEdit: boolean;
}) {
  if (substitutions.length === 0) {
    return <p className="text-sm text-zinc-500">Aucun changement pour le moment.</p>;
  }

  const sorted = [...substitutions].sort((a, b) => (a.minute ?? 0) - (b.minute ?? 0));

  return (
    <ul className="space-y-1.5">
      {sorted.map((substitution) => (
        <SubstitutionItem
          key={substitution.id}
          substitution={substitution}
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
