import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "FollowMyScore";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logoData = await readFile(join(process.cwd(), "src/app/icon.png"));
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "#0f1210",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
        }}
      >
        <img alt="" src={logoSrc} width={220} height={220} style={{ borderRadius: 40 }} />
        <div style={{ display: "flex", fontSize: 64, fontWeight: 800, color: "#f2f2ef" }}>
          Follow<span style={{ color: "#22c55e" }}>My</span>Score
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#9ca3af" }}>
          Suivi en direct des matchs de football amateur
        </div>
      </div>
    ),
    { ...size }
  );
}
