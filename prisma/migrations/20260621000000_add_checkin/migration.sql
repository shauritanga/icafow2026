-- Entrance check-in for scanned receipt QR: records when (and by which admin)
-- an attendee was checked in at the gate. Null until checked in.

-- AlterTable
ALTER TABLE "Registration" ADD COLUMN     "checkedInAt" TIMESTAMP(3),
ADD COLUMN     "checkedInBy" TEXT;
