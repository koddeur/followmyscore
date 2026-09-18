import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@live-score.test" },
    update: {},
    create: { name: "Admin", username: "admin", email: "admin@live-score.test", passwordHash, role: "ADMIN" },
  });

  const editor = await prisma.user.upsert({
    where: { email: "editeur@live-score.test" },
    update: {},
    create: { name: "Éditeur", username: "editeur", email: "editeur@live-score.test", passwordHash, role: "USER" },
  });

  await prisma.user.upsert({
    where: { email: "supporter@live-score.test" },
    update: {},
    create: { name: "Supporter", username: "supporter", email: "supporter@live-score.test", passwordHash, role: "USER" },
  });

  const [home, away] = await Promise.all([
    prisma.club.upsert({
      where: { fffId: "demo-home" },
      update: {},
      create: { name: "AS Villeneuve", fffId: "demo-home" },
    }),
    prisma.club.upsert({
      where: { fffId: "demo-away" },
      update: {},
      create: { name: "FC Lagny", fffId: "demo-away" },
    }),
  ]);

  const existing = await prisma.match.findFirst({
    where: { homeClubId: home.id, awayClubId: away.id },
  });

  if (!existing) {
    const kickoffAt = new Date();
    const slug = `${slugify(home.name)}-vs-${slugify(away.name)}-${kickoffAt.toISOString().slice(0, 10)}`;
    await prisma.match.create({
      data: {
        slug,
        homeClubId: home.id,
        awayClubId: away.id,
        homeScore: 1,
        awayScore: 0,
        status: "LIVE",
        competition: "Coupe départementale",
        venue: "Stade municipal",
        kickoffAt,
        createdById: admin.id,
        updates: {
          create: { userId: admin.id, type: "NOTE", message: "Match créé" },
        },
        goals: {
          create: {
            clubId: home.id,
            scorerName: "J. Martin",
            minute: 23,
            createdById: editor.id,
          },
        },
      },
    });
  }

  console.log("Seed terminé. Comptes de démo (mot de passe : password123) :");
  console.log("  admin@live-score.test     (ADMIN)");
  console.log("  editeur@live-score.test   (USER)");
  console.log("  supporter@live-score.test (USER)");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
