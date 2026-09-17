import { prisma } from "../src/lib/prisma";

async function main() {
  const match = await prisma.match.findFirst({ include: { homeClub: true, awayClub: true } });
  if (!match) throw new Error("no match");

  const res = await fetch("http://localhost:3000/");
  const html = await res.text();
  console.log("home status", res.status);
  console.log("has lg:grid-cols-3:", html.includes("lg:grid-cols-3"));

  // Card structure checks (no venue text, home club name present).
  const cardStart = html.indexOf(`>${match.homeClub.name}<`);
  console.log("home club name rendered:", cardStart !== -1);

  // No venue paragraph markup should remain in MatchCard output.
  console.log("no leftover venue-only block class:", !html.includes('class="mt-2 flex items-center justify-between gap-2 text-xs text-zinc-500"'));
}

main().finally(() => prisma.$disconnect());
