import "server-only";

/**
 * Best-effort integration with the FFF backend (api-dofa.fff.fr).
 *
 * This is NOT a documented public API: it's the private backend used by FFF's own
 * website. Requests from this project's own sandbox get 403 Forbidden (including with
 * the `.json` + `?filter=` suffix, and against the alternate host
 * `api-dofa.prd-aws.fff.fr`, which doesn't even resolve from there) — likely bot/IP
 * based filtering. Confirmed WORKING from a residential network (verified 2026-09-14
 * with club 12152 / team 1), so it depends on where the Next.js server actually runs:
 * fine on a home network or most VPS/residential-ish IPs, may still 403 from some
 * cloud/datacenter ranges (Vercel included) if FFF blocks those too — untested.
 *
 * The endpoint map and the `/equipes` and `/matchs` response shapes below are
 * confirmed against real payloads. Other endpoints (calendrier, resultat,
 * match_entities, compets/*) are wired up with the same URL convention but their
 * response shapes are still unverified — treat their return type as raw/`unknown`
 * until someone gets a real sample.
 *
 * Disabled by default (FFF_API_ENABLED=false in .env.example). Toggle it on once you
 * know your deployment's outbound IP isn't blocked.
 */

const BASE_URL = process.env.FFF_API_BASE_URL ?? "https://api-dofa.fff.fr";
const ENABLED = process.env.FFF_API_ENABLED === "true";

export function isFffEnabled() {
  return ENABLED;
}

async function fffFetch<T = unknown>(path: string): Promise<T | null> {
  if (!ENABLED) return null;

  const url = `${BASE_URL}${path}.json?filter=`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.warn(`[fff] ${path} failed with status ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (error) {
    console.warn(`[fff] request to ${path} failed`, error);
    return null;
  }
}

// -- Club --------------------------------------------------------------

interface FffRawTerrain2 {
  te_no: number;
  name: string;
  city: string | null;
  address: string | null;
  zip_code: string | null;
  libelle_surface: string | null;
}

interface FffRawMembre {
  in_nom: string;
  in_prenom: string;
  ti_lib: string;
}

interface FffRawContact {
  type: string;
  type_label: string;
  value: string;
}

interface FffRawClubDetail {
  cl_no: number;
  district: { name: string; short_name: string } | null;
  department_code: number | null;
  affiliation_number: number | null;
  name: string;
  short_name: string | null;
  location: string | null;
  colors: string | null;
  address1: string | null;
  address2: string | null;
  address3: string | null;
  postal_code: string | null;
  distributor_office: string | null;
  cl_statut: string | null;
  latitude: number | null;
  longitude: number | null;
  terrains: FffRawTerrain2[];
  membres: FffRawMembre[];
  logo: string | null;
  contacts: FffRawContact[];
  external_updated_at: string | null;
}

export interface FffClubDetail {
  fffId: string;
  name: string;
  shortName: string | null;
  location: string | null;
  colors: string | null;
  address: string | null;
  postalCode: string | null;
  distributorOffice: string | null;
  departmentCode: number | null;
  affiliationNumber: number | null;
  status: string | null;
  district: { name: string; shortName: string } | null;
  latitude: number | null;
  longitude: number | null;
  logo: string | null;
  terrains: { name: string; city: string | null; address: string | null; surface: string | null }[];
  staff: { name: string; role: string }[];
  contacts: { label: string; value: string }[];
  updatedAt: string | null;
}

function mapFffClubDetail(raw: FffRawClubDetail): FffClubDetail {
  return {
    fffId: String(raw.cl_no),
    name: raw.name,
    shortName: raw.short_name,
    location: raw.location,
    colors: raw.colors,
    address: [raw.address1, raw.address2, raw.address3].filter(Boolean).join(", ") || null,
    postalCode: raw.postal_code,
    distributorOffice: raw.distributor_office,
    departmentCode: raw.department_code,
    affiliationNumber: raw.affiliation_number,
    status: raw.cl_statut,
    district: raw.district ? { name: raw.district.name, shortName: raw.district.short_name } : null,
    latitude: raw.latitude,
    longitude: raw.longitude,
    logo: raw.logo,
    terrains: (raw.terrains ?? []).map((t) => ({
      name: t.name,
      city: t.city,
      address: t.address,
      surface: t.libelle_surface,
    })),
    staff: (raw.membres ?? []).map((m) => ({
      name: `${m.in_prenom} ${m.in_nom}`.trim(),
      role: m.ti_lib,
    })),
    contacts: (raw.contacts ?? []).map((c) => ({ label: c.type_label, value: c.value })),
    updatedAt: raw.external_updated_at,
  };
}

export async function getFffClubDetail(fffId: string): Promise<FffClubDetail | null> {
  const raw = await fffFetch<FffRawClubDetail>(`/api/clubs/${fffId}`);
  if (!raw || !raw.cl_no) return null;
  return mapFffClubDetail(raw);
}

export function getFffClub(clubId: string) {
  return fffFetch(`/api/clubs/${clubId}`);
}

export function getFffClubTeams(clubId: string) {
  return fffFetch(`/api/clubs/${clubId}/equipes`);
}

interface FffRawEngagement {
  competition: { type: string; name: string } | null;
}

interface FffRawEquipe {
  number: number;
  category_code: string;
  category_label: string;
  category_gender: string;
  engagements: FffRawEngagement[];
}

export interface FffTeamOption {
  number: number;
  categoryCode: string;
  /** Name of the "CH" (championnat) competition this team is engaged in. */
  competitionName: string;
  gender: string;
}

/**
 * One entry per team (an "équipe") a club has fielded this season, labeled by
 * its championship. Teams with no "CH" (championnat) engagement — only cup or
 * friendly games — are dropped, since they have no competition.name to show.
 */
export async function getFffClubCategories(fffId: string): Promise<FffTeamOption[] | null> {
  const raw = await fffFetch<FffRawEquipe[]>(`/api/clubs/${fffId}/equipes`);
  if (!Array.isArray(raw)) return null;

  return raw
    .flatMap((t) => {
      const championship = (t.engagements ?? []).find(
        (e) => e.competition?.type === "CH" && e.competition.name
      );
      if (!t.number || !championship?.competition) return [];

      return [
        {
          number: t.number,
          categoryCode: t.category_code,
          competitionName: championship.competition.name,
          gender: t.category_gender,
        },
      ];
    })
    .sort((a, b) => a.competitionName.localeCompare(b.competitionName) || a.number - b.number);
}

export function getFffClubCalendar(clubId: string) {
  return fffFetch(`/api/clubs/${clubId}/calendrier`);
}

export function getFffClubMatches(clubId: string) {
  return fffFetch(`/api/clubs/${clubId}/matchs`);
}

export function getFffClubResults(clubId: string) {
  return fffFetch(`/api/clubs/${clubId}/resultat`);
}

// -- Match ---------------------------------------------------------------

export function getFffMatch(matchId: string) {
  return fffFetch(`/api/match_entities/${matchId}`);
}

// -- Team (club + équipe) -------------------------------------------------

export function getFffTeamCalendar(clubId: string, teamId: string) {
  return fffFetch(`/api/clubs/${clubId}/equipes/${teamId}/calendrier`);
}

interface FffRawTeamRef {
  club: { cl_no: number };
  short_name: string;
}

interface FffRawTerrain {
  name: string;
  city: string;
}

interface FffRawMatch {
  ma_no: number;
  competition: { name: string } | null;
  home: FffRawTeamRef;
  away: FffRawTeamRef;
  terrain: FffRawTerrain | null;
  date: string | null;
  time: string | null;
  home_score: number | null;
  away_score: number | null;
  seems_postponed: string | null;
}

export interface FffMatchSummary {
  fffId: string;
  homeClubFffId: string;
  homeClubName: string;
  awayClubFffId: string;
  awayClubName: string;
  competition: string | null;
  venue: string | null;
  /** ISO 8601, or null if the date/time couldn't be parsed. */
  kickoffAt: string | null;
  homeScore: number | null;
  awayScore: number | null;
  isFinished: boolean;
  isPostponed: boolean;
}

/** FFF splits date ("2026-08-05T00:00:00+00:00", time always zeroed) and time ("19H30"). */
function parseFffKickoff(dateStr: string | null, timeStr: string | null): string | null {
  if (!dateStr) return null;
  const datePart = dateStr.slice(0, 10);
  const timeMatch = /^(\d{1,2})H(\d{2})$/.exec((timeStr ?? "").trim());
  const hours = timeMatch ? timeMatch[1].padStart(2, "0") : "00";
  const minutes = timeMatch ? timeMatch[2] : "00";
  const parsed = new Date(`${datePart}T${hours}:${minutes}:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function mapFffMatch(raw: FffRawMatch): FffMatchSummary | null {
  if (!raw.home?.club?.cl_no || !raw.away?.club?.cl_no || !raw.ma_no) return null;

  const venue = raw.terrain?.name
    ? `${raw.terrain.name}${raw.terrain.city ? ` — ${raw.terrain.city}` : ""}`
    : null;

  return {
    fffId: String(raw.ma_no),
    homeClubFffId: String(raw.home.club.cl_no),
    homeClubName: raw.home.short_name || "Domicile",
    awayClubFffId: String(raw.away.club.cl_no),
    awayClubName: raw.away.short_name || "Extérieur",
    competition: raw.competition?.name ?? null,
    venue,
    kickoffAt: parseFffKickoff(raw.date, raw.time),
    homeScore: raw.home_score,
    awayScore: raw.away_score,
    isFinished: typeof raw.home_score === "number" && typeof raw.away_score === "number",
    isPostponed: raw.seems_postponed === "O",
  };
}

export function getFffTeamMatches(clubId: string, teamId: string) {
  return fffFetch<FffRawMatch[]>(`/api/clubs/${clubId}/equipes/${teamId}/matchs`);
}

export async function getFffTeamMatchSummaries(
  clubId: string,
  teamId: string
): Promise<FffMatchSummary[] | null> {
  const raw = await getFffTeamMatches(clubId, teamId);
  if (!Array.isArray(raw)) return null;
  return raw.map(mapFffMatch).filter((m): m is FffMatchSummary => m !== null);
}

export function getFffTeamResults(clubId: string, teamId: string) {
  return fffFetch(`/api/clubs/${clubId}/equipes/${teamId}/resultat`);
}

// -- Competition (compétition / phase / poule) -----------------------------

export function getFffCompetitionStandings(compId: string, phaseId: string, poolId: string) {
  return fffFetch(
    `/api/compets/${compId}/phases/${phaseId}/poules/${poolId}/classement_journees`
  );
}

export function getFffCompetitionCalendar(compId: string, phaseId: string, poolId: string) {
  return fffFetch(`/api/compets/${compId}/phases/${phaseId}/poules/${poolId}/calendrier`);
}

export function getFffCompetitionResults(compId: string, phaseId: string, poolId: string) {
  return fffFetch(`/api/compets/${compId}/phases/${phaseId}/poules/${poolId}/resultat`);
}
