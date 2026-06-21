-- N-of-M entrance check-in: bundled seats per registration + how many entered.

-- AlterTable
ALTER TABLE "Registration" ADD COLUMN     "seats" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "checkedInCount" INTEGER NOT NULL DEFAULT 0;

-- Backfill seats for existing sponsor/exhibitor bundles by package id.
UPDATE "Registration" SET "seats" = CASE "packageId"
  WHEN 'strategic'  THEN 10
  WHEN 'platinum'   THEN 6
  WHEN 'gold'       THEN 4
  WHEN 'silver'     THEN 2
  WHEN 'bronze'     THEN 1
  WHEN 'innovation' THEN 2
  WHEN 'leadership' THEN 4
  ELSE 1 END
WHERE "type" IN ('SPONSOR', 'EXHIBITOR');

-- Existing rows already checked in (single flag) count as one person entered.
UPDATE "Registration" SET "checkedInCount" = 1 WHERE "checkedInAt" IS NOT NULL;
