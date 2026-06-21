-- Virtual (online) passes are not physical entrants: zero out their entrance
-- seats and any prior check-in count so they drop out of the gate headcount.
UPDATE "Registration"
SET "seats" = 0, "checkedInCount" = 0
WHERE "packageId" = 'virtual';
