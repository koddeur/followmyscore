// Events with a minute sort by minute first; events without one fall back
// to creation time and trail after every timed event (no minute value
// realistically reaches this offset).
const NO_MINUTE_OFFSET = 100_000;

export function sortByMinuteThenCreatedAt<T extends { minute: number | null; createdAt: Date }>(
  items: T[]
): T[] {
  function sortKey(item: T): number {
    return item.minute !== null ? item.minute : NO_MINUTE_OFFSET + item.createdAt.getTime();
  }
  return [...items].sort((a, b) => sortKey(a) - sortKey(b));
}
