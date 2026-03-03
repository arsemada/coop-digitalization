-- Fix: add is_active to accounts (required by Account entity).
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
