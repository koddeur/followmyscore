"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function ClubTeamFilter({
  teams,
}: {
  teams: { number: number; competitionName: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("team") ?? "";

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("team", value);
    } else {
      params.delete("team");
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="team-filter" className="text-sm font-medium text-zinc-500">
        Équipe
      </label>
      <select
        id="team-filter"
        value={current}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
      >
        <option value="">Toutes les équipes</option>
        {teams.map((team) => (
          <option key={team.number} value={team.competitionName}>
            {team.competitionName} (Équipe n°{team.number})
          </option>
        ))}
      </select>
    </div>
  );
}
