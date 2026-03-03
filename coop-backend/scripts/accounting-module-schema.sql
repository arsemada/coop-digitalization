-- Accounting module extensions (optional; Hibernate ddl-auto=update can add these).
-- Run only if you manage schema manually.

-- Accounts: is_active
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Journal entries: reference_number, total_debit, total_credit
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS reference_number VARCHAR(64);
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS total_debit DECIMAL(19,2) DEFAULT 0;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS total_credit DECIMAL(19,2) DEFAULT 0;

-- Journal lines: member_id, product_type, product_category
ALTER TABLE journal_lines ADD COLUMN IF NOT EXISTS member_id BIGINT;
ALTER TABLE journal_lines ADD COLUMN IF NOT EXISTS product_type VARCHAR(32);
ALTER TABLE journal_lines ADD COLUMN IF NOT EXISTS product_category VARCHAR(64);
