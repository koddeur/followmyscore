-- Password becomes optional: OAuth-only accounts (Google, Facebook) have no
-- password of their own.
ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;
