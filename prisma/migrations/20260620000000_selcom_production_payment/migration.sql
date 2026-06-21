-- Production Selcom payment support: per-attempt unique gateway order id and
-- a snapshot of the exact charge sent to the gateway for reconciliation.

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "attempt" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "chargeAmount" INTEGER,
ADD COLUMN     "chargeCurrency" "Currency" DEFAULT 'TZS';

-- CreateIndex
CREATE UNIQUE INDEX "Payment_selcomOrderId_key" ON "Payment"("selcomOrderId");
