import { CardItem } from "@/components/CardItem";
import { sortByMinuteThenCreatedAt } from "@/lib/eventSort";
import type { ClubInfo, LineupEntryInfo } from "@/components/PlayerFields";

export interface CardData {
  id: string;
  playerName: string | null;
  number: number | null;
  type: "YELLOW" | "RED";
  minute: number | null;
  createdAt: Date;
  club: { id: string; name: string };
}

export function CardsList({
  cards,
  homeClub,
  awayClub,
  homeLineupEntries,
  awayLineupEntries,
  canEdit,
}: {
  cards: CardData[];
  homeClub: ClubInfo;
  awayClub: ClubInfo;
  homeLineupEntries: LineupEntryInfo[];
  awayLineupEntries: LineupEntryInfo[];
  canEdit: boolean;
}) {
  if (cards.length === 0) {
    return <p className="text-sm text-zinc-500">Aucun carton pour le moment.</p>;
  }

  const sorted = sortByMinuteThenCreatedAt(cards);

  return (
    <ul className="space-y-0">
      {sorted.map((card) => (
        <CardItem
          key={card.id}
          card={card}
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
