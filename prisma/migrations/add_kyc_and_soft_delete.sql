-- Migration per aggiungere KycDocument, soft delete e documenti aggiuntivi

-- 1. Aggiungi colonne soft delete a customers
ALTER TABLE customers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;
CREATE INDEX IF NOT EXISTS customers_deleted_at_idx ON customers(deleted_at);

-- 2. Aggiungi colonne soft delete a accounts
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;
CREATE INDEX IF NOT EXISTS accounts_deleted_at_idx ON accounts(deleted_at);

-- 3. Crea tabella kyc_documents
CREATE TABLE IF NOT EXISTS kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size_bytes INTEGER NOT NULL,
  storage_url VARCHAR(500) NOT NULL,
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS kyc_documents_customer_id_idx ON kyc_documents(customer_id);
CREATE INDEX IF NOT EXISTS kyc_documents_uploaded_at_idx ON kyc_documents(uploaded_at DESC);
