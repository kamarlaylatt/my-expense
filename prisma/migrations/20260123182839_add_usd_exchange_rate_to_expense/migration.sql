-- AlterTable: First add the column as nullable
ALTER TABLE "Expense" ADD COLUMN "usdExchangeRate" DECIMAL(18,8);

-- Backfill: Set usdExchangeRate for existing expenses from their related currency
UPDATE "Expense" e
SET "usdExchangeRate" = (
  SELECT c."usdExchangeRate"
  FROM "Currency" c
  WHERE c.id = e."currencyId"
);

-- AlterTable: Now make the column NOT NULL
ALTER TABLE "Expense" ALTER COLUMN "usdExchangeRate" SET NOT NULL;
