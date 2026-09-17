export interface LineupViewData {
  entries: { id: string; playerName: string; number: number | null; position: string | null; isStarting: boolean }[];
}

export function LineupView({ clubName, lineup }: { clubName: string; lineup: LineupViewData | null }) {
  if (!lineup || lineup.entries.length === 0) {
    return (
      <div>
        <h3 className="mb-1 text-sm font-semibold">{clubName}</h3>
        <p className="text-sm text-zinc-500">Composition non renseignée.</p>
      </div>
    );
  }

  const starters = lineup.entries.filter((e) => e.isStarting);
  const subs = lineup.entries.filter((e) => !e.isStarting);

  return (
    <div>
      <h3 className="mb-1 text-sm font-semibold">{clubName}</h3>
      <ol className="space-y-0.5 text-sm">
        {starters.map((entry) => (
          <li key={entry.id}>
            {entry.number !== null && <span className="mr-1.5 font-mono text-zinc-500">{entry.number}</span>}
            {entry.playerName}
            {entry.position && <span className="ml-1.5 text-xs text-zinc-500">({entry.position})</span>}
          </li>
        ))}
      </ol>
      {subs.length > 0 && (
        <>
          <p className="mt-2 text-xs font-medium text-zinc-500">Remplaçants</p>
          <ol className="space-y-0.5 text-sm text-zinc-600 dark:text-zinc-400">
            {subs.map((entry) => (
              <li key={entry.id}>
                {entry.number !== null && <span className="mr-1.5 font-mono">{entry.number}</span>}
                {entry.playerName}
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}
