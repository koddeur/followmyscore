-- Reassign anyone with the EDITOR role to USER before the value is removed.
UPDATE "User" SET "role" = 'USER' WHERE "role" = 'EDITOR';

-- Postgres can't drop an enum value directly: swap in a narrower type.
CREATE TYPE "Role_new" AS ENUM ('USER', 'ADMIN');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';
DROP TYPE "Role";
ALTER TYPE "Role_new" RENAME TO "Role";
