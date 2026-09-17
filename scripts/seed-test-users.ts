import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const COUNT = 300;
const EMAIL_DOMAIN = "test.local"; // reserved by IANA for testing, never a real domain

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const data = Array.from({ length: COUNT }, (_, i) => {
    const n = i + 1;
    return {
      name: `Test User ${n}`,
      username: `test_user_${n}`,
      email: `test-user-${n}@${EMAIL_DOMAIN}`,
      passwordHash,
      role: "USER" as const,
    };
  });

  const result = await prisma.user.createMany({ data, skipDuplicates: true });
  console.log(`Créé ${result.count} comptes de test (mot de passe : password123).`);
  console.log(`Pour les supprimer une fois le test terminé : npm run cleanup:test-users`);
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
