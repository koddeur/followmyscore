import { RecentEventHighlight } from "@/components/RecentEventHighlight";
import { sortByMinuteThenCreatedAt } from "@/lib/eventSort";
import { GoalIcon, CardIcon, SubstitutionIcon } from "@/components/MatchEventIcons";

export interface MatchHeaderEventItem {
  kind: "goal" | "yellow" | "red" | "substitution";
  minute: number | null;
  playerName: string | null;
  playerNumber: number | null;
  ownGoal?: boolean;
  penalty?: boolean;
  createdAt: Date;
}

function EventIcon({ kind }: { kind: MatchHeaderEventItem["kind"] }) {
  if (kind === "goal") return <GoalIcon className="h-3.5 w-3.5 shrink-0 text-accent" />;
  if (kind === "yellow") return <CardIcon type="YELLOW" className="h-3 w-3 shrink-0" />;
  if (kind === "red") return <CardIcon type="RED" className="h-3 w-3 shrink-0" />;
  return <SubstitutionIcon className="h-3.5 w-3.5 shrink-0" />;
}

function fallbackLabel(kind: MatchHeaderEventItem["kind"]) {
  if (kind === "goal") return "But";
  if (kind === "substitution") return "Changement";
  return "Carton";
}

export function MatchHeaderEvents({
  items,
  align,
}: {
  items: MatchHeaderEventItem[];
  align: "left" | "right";
}) {
  if (items.length === 0) return null;

  const sorted = sortByMinuteThenCreatedAt(items);

  return (
    <ul className={`mt-1 space-y-0.5 text-xs text-zinc-500 ${align === "right" ? "text-right" : "text-left"}`}>
      {sorted.map((item, i) => {
        const row = (
          <div
            className={`flex items-center gap-1 ${align === "right" ? "justify-end" : "justify-start"}`}
          >
            {align === "left" && <EventIcon kind={item.kind} />}
            <span className="truncate">
              {item.kind === "substitution" ? (
                <>
                  {fallbackLabel(item.kind)}
                  {item.minute !== null && ` ${item.minute}'`}
                </>
              ) : (
                <>
                  {item.playerName ?? fallbackLabel(item.kind)}
                  {item.playerNumber !== null && ` #${item.playerNumber}`}
                  {item.ownGoal && " (csc)"}
                  {item.penalty && " (pén.)"}
                  {item.minute !== null && ` ${item.minute}'`}
                </>
              )}
            </span>
            {align === "right" && <EventIcon kind={item.kind} />}
          </div>
        );

        return (
          <li key={i}>
            <RecentEventHighlight createdAt={item.createdAt} className="rounded px-1">
              {row}
            </RecentEventHighlight>
          </li>
        );
      })}
    </ul>
  );
}
