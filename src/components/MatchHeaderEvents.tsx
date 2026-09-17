export interface MatchHeaderEventItem {
  kind: "goal" | "yellow" | "red" | "substitution";
  minute: number | null;
  playerName: string | null;
  playerNumber: number | null;
  ownGoal?: boolean;
  penalty?: boolean;
}

function EventIcon({ kind }: { kind: MatchHeaderEventItem["kind"] }) {
  if (kind === "goal") return <span>⚽</span>;
  if (kind === "yellow") return <span>🟨</span>;
  if (kind === "red") return <span>🟥</span>;
  return <span>🔄</span>;
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

  const sorted = [...items].sort((a, b) => (a.minute ?? 0) - (b.minute ?? 0));

  return (
    <ul className={`mt-1 space-y-0.5 text-xs text-zinc-500 ${align === "right" ? "text-right" : "text-left"}`}>
      {sorted.map((item, i) => (
        <li
          key={i}
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
        </li>
      ))}
    </ul>
  );
}
