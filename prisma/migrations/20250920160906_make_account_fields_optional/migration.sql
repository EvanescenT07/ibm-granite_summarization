-- AlterTable
ALTER TABLE "public"."Account" ALTER COLUMN "scope" DROP NOT NULL,
ALTER COLUMN "id_token" DROP NOT NULL,
ALTER COLUMN "session_state" DROP NOT NULL;
