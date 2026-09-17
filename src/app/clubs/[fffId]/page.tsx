import { notFound } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { getFffClubDetail, getFffClubCategories } from "@/lib/fff";
import { MatchCard } from "@/components/MatchCard";
import { ClubTeamFilter } from "@/components/ClubTeamFilter";
import { STATUS_PRIORITY } from "@/lib/matchStatus";

const STATUS_LABELS: Record<string, string> = {
  A: "Actif",
  R: "Radié",
};

function ContactValue({ value }: { value: string }) {
  const trimmed = value.trim();

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return (
      <a href={`mailto:${trimmed}`} className="text-accent hover:underline">
        {trimmed}
      </a>
    );
  }

  if (/^(https?:\/\/|www\.)/i.test(trimmed)) {
    const href = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
        {trimmed}
      </a>
    );
  }

  const digitsOnly = trimmed.replace(/[\s.\-()]/g, "");
  if (/^\+?\d{6,}$/.test(digitsOnly)) {
    return (
      <a href={`tel:${digitsOnly}`} className="text-accent hover:underline">
        {trimmed}
      </a>
    );
  }

  return <>{trimmed}</>;
}

export default async function ClubPage({
  params,
  searchParams,
}: PageProps<"/clubs/[fffId]">) {
  const { fffId } = await params;
  const { team: teamFilter } = await searchParams;
  const teamFilterValue = typeof teamFilter === "string" ? teamFilter : "";

  // The URL is the FFF club number (cl_no) for imported clubs; fall back to
  // the internal id for the handful of manually-created clubs with no fffId.
  const club = await prisma.club.findFirst({ where: { OR: [{ fffId }, { id: fffId }] } });

  if (!club) notFound();

  const [details, teams, matches] = await Promise.all([
    club.fffId ? getFffClubDetail(club.fffId) : Promise.resolve(null),
    club.fffId ? getFffClubCategories(club.fffId) : Promise.resolve(null),
    prisma.match.findMany({
      where: {
        OR: [{ homeClubId: club.id }, { awayClubId: club.id }],
        ...(teamFilterValue ? { competition: teamFilterValue } : {}),
      },
      include: { homeClub: true, awayClub: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  matches.sort((a, b) => STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status]);

  const logo = details?.logo ?? club.logoUrl;
  const name = details?.name ?? club.name;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-6 text-center">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt={name} className="mx-auto h-24 w-24 rounded-full object-contain" />
        ) : (
          <span className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-background text-2xl font-semibold text-zinc-400">
            {name.charAt(0)}
          </span>
        )}
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">{name}</h1>
        {details && (
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-500">
            {details.shortName && details.shortName !== details.name && <span>{details.shortName}</span>}
            {details.district && (
              <span>
                {details.shortName && details.shortName !== details.name && "· "}
                {details.district.name}
              </span>
            )}
            {details.status && (
              <span className="rounded-full bg-background px-2 py-0.5">
                {STATUS_LABELS[details.status] ?? details.status}
              </span>
            )}
            {details.colors && <span>Couleurs : {details.colors}</span>}
          </div>
        )}
      </div>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Matchs</h2>
          {teams && teams.length > 0 && <ClubTeamFilter teams={teams} />}
        </div>
        {matches.length === 0 ? (
          <p className="text-sm text-zinc-500">
            {teamFilterValue ? "Aucun match pour cette équipe." : "Aucun match pour le moment."}
          </p>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} showViews />
            ))}
          </div>
        )}
      </section>

      {!details && club.fffId && (
        <p className="mx-auto max-w-2xl text-center text-sm text-zinc-500">
          Informations complémentaires de la FFF indisponibles pour le moment.
        </p>
      )}

      {details && (
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-3 text-lg font-semibold">Localisation</h2>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              {details.address && (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-zinc-500">Adresse</dt>
                  <dd>{details.address}</dd>
                </div>
              )}
              {details.location && (
                <div>
                  <dt className="text-xs text-zinc-500">Ville</dt>
                  <dd>{details.location}</dd>
                </div>
              )}
              {details.postalCode && (
                <div>
                  <dt className="text-xs text-zinc-500">Code postal</dt>
                  <dd>{details.postalCode}</dd>
                </div>
              )}
              {details.departmentCode !== null && (
                <div>
                  <dt className="text-xs text-zinc-500">Département</dt>
                  <dd>{details.departmentCode}</dd>
                </div>
              )}
              {details.distributorOffice && (
                <div>
                  <dt className="text-xs text-zinc-500">Bureau distributeur</dt>
                  <dd>{details.distributorOffice}</dd>
                </div>
              )}
              {details.affiliationNumber !== null && (
                <div>
                  <dt className="text-xs text-zinc-500">N° d&apos;affiliation</dt>
                  <dd>{details.affiliationNumber}</dd>
                </div>
              )}
              {details.latitude !== null && details.longitude !== null && (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-zinc-500">Coordonnées</dt>
                  <dd>
                    <a
                      href={`https://www.google.com/maps?q=${details.latitude},${details.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                    >
                      Voir sur la carte
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </section>

          {details.terrains.length > 0 && (
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-3 text-lg font-semibold">Terrains</h2>
              <ul className="space-y-3 text-sm">
                {details.terrains.map((terrain, i) => (
                  <li key={i}>
                    <p className="font-medium">{terrain.name}</p>
                    <p className="text-xs text-zinc-500">
                      {[terrain.address, terrain.city].filter(Boolean).join(", ")}
                      {terrain.surface && ` · ${terrain.surface}`}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {teams && teams.length > 0 && (
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-3 text-lg font-semibold">Équipes</h2>
              <ul className="divide-y divide-border">
                {teams.map((team) => (
                  <li key={team.number} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <span className="font-medium">{team.competitionName}</span>
                    <span className="shrink-0 text-xs text-zinc-500">Équipe n°{team.number}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {details.contacts.length > 0 && (
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-3 text-lg font-semibold">Contacts</h2>
              <ul className="space-y-1.5 text-sm">
                {details.contacts.map((contact, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">{contact.label}</span>
                    <span>
                      <ContactValue value={contact.value} />
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {details.staff.length > 0 && (
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-3 text-lg font-semibold">Bureau et encadrement</h2>
              <ul className="grid gap-1.5 text-sm sm:grid-cols-2">
                {details.staff.map((member, i) => (
                  <li key={i}>
                    <span className="font-medium">{member.name}</span>{" "}
                    <span className="text-xs text-zinc-500">— {member.role}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {details.updatedAt && (
            <p className="text-center text-xs text-zinc-400">
              Dernière mise à jour FFF : {format(new Date(details.updatedAt), "d MMMM yyyy", { locale: fr })}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
