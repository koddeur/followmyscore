import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { prisma } from "@/lib/prisma";

export const alt = "FollowMyScore";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const COLORS = {
  background: "#0f1210",
  card: "#171a17",
  border: "#262a26",
  accent: "#22c55e",
  foreground: "#f2f2ef",
  muted: "#9ca3af",
};

function ClubBadge({ name, logoUrl }: { name: string; logoUrl: string | null }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: 340,
      }}
    >
      {logoUrl ? (
        <img
          alt=""
          src={logoUrl}
          width={180}
          height={180}
          style={{ borderRadius: "9999px", objectFit: "contain", background: COLORS.card }}
        />
      ) : (
        <div
          style={{
            display: "flex",
            width: 180,
            height: 180,
            borderRadius: "9999px",
            background: COLORS.card,
            border: `2px solid ${COLORS.border}`,
            alignItems: "center",
            justifyContent: "center",
            fontSize: 72,
            fontWeight: 700,
            color: COLORS.muted,
          }}
        >
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      <div
        style={{
          display: "flex",
          marginTop: 24,
          fontSize: 34,
          fontWeight: 600,
          color: COLORS.foreground,
          textAlign: "center",
          textWrap: "balance",
        }}
      >
        {name}
      </div>
    </div>
  );
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const match = await prisma.match.findUnique({
    where: { slug },
    include: { homeClub: true, awayClub: true },
  });

  const logoData = await readFile(join(process.cwd(), "src/app/icon.png"));
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

  if (!match) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            background: COLORS.background,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img alt="" src={logoSrc} width={140} height={140} style={{ borderRadius: 24 }} />
        </div>
      ),
      { ...size }
    );
  }

  const hasScore =
    match.status === "LIVE" ||
    match.status === "HALFTIME" ||
    match.status === "INTERRUPTED" ||
    match.status === "FINISHED";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: COLORS.background,
          padding: 64,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img alt="" src={logoSrc} width={56} height={56} style={{ borderRadius: 12 }} />
          <div style={{ display: "flex", fontSize: 32, fontWeight: 700, color: COLORS.foreground }}>
            FollowMyScore
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: 56,
          }}
        >
          <ClubBadge name={match.homeClub.name} logoUrl={match.homeClub.logoUrl} />

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {hasScore ? (
              <div
                style={{
                  display: "flex",
                  fontSize: 96,
                  fontWeight: 800,
                  color: COLORS.accent,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {match.homeScore} – {match.awayScore}
              </div>
            ) : (
              <div style={{ display: "flex", fontSize: 56, fontWeight: 700, color: COLORS.muted }}>
                VS
              </div>
            )}
          </div>

          <ClubBadge name={match.awayClub.name} logoUrl={match.awayClub.logoUrl} />
        </div>

        {(match.competition || match.venue) && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              fontSize: 26,
              color: COLORS.muted,
            }}
          >
            {[match.competition, match.venue].filter(Boolean).join(" · ")}
          </div>
        )}
      </div>
    ),
    { ...size }
  );
}
