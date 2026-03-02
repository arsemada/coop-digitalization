-- Add locked_amount to member_savings_accounts (for USSD / loan collateral).
-- Run once: psql -h localhost -p 5433 -U coop -d coopdb -f add-locked-amount.sql
ALTER TABLE member_savings_accounts
  ADD COLUMN IF NOT EXISTS locked_amount NUMERIC(19,2) NOT NULL DEFAULT 0;
