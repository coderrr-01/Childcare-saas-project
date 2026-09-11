-- V017: Billing tables

-- Billing accounts (per family)
CREATE TABLE billing_accounts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organisation_id BIGINT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    centre_id BIGINT NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
    family_id BIGINT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    account_number VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'CLOSED')),
    balance NUMERIC(12,2) NOT NULL DEFAULT 0,
    credit_limit NUMERIC(12,2) DEFAULT 0,
    payment_terms_days INT NOT NULL DEFAULT 14,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_billing_accounts_family ON billing_accounts(family_id);
CREATE INDEX idx_billing_accounts_centre ON billing_accounts(centre_id);

-- Invoices
CREATE TABLE invoices (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organisation_id BIGINT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    centre_id BIGINT NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
    billing_account_id BIGINT NOT NULL REFERENCES billing_accounts(id),
    family_id BIGINT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING', 'PAID', 'OVERDUE', 'CANCELLED')),
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    gst NUMERIC(12,2) NOT NULL DEFAULT 0,
    total NUMERIC(12,2) NOT NULL DEFAULT 0,
    amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
    amount_owing NUMERIC(12,2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoices_family ON invoices(family_id);
CREATE INDEX idx_invoices_centre ON invoices(centre_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date) WHERE status IN ('PENDING', 'OVERDUE');
CREATE UNIQUE INDEX idx_invoices_number ON invoices(invoice_number, organisation_id);

-- Invoice line items
CREATE TABLE invoice_line_items (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    invoice_id BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    child_id BIGINT REFERENCES children(id) ON DELETE SET NULL,
    description VARCHAR(300) NOT NULL,
    quantity NUMERIC(8,2) NOT NULL DEFAULT 1,
    unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
    amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoice_line_items_invoice ON invoice_line_items(invoice_id);

-- Payments
CREATE TABLE payments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organisation_id BIGINT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    centre_id BIGINT NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
    invoice_id BIGINT NOT NULL REFERENCES invoices(id),
    family_id BIGINT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(30) NOT NULL CHECK (payment_method IN ('CASH', 'CARD', 'BANK_TRANSFER', 'CHEQUE', 'DIRECT_DEBIT', 'OTHER')),
    payment_date DATE NOT NULL,
    reference_number VARCHAR(100),
    notes TEXT,
    recorded_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_family ON payments(family_id);
CREATE INDEX idx_payments_centre ON payments(centre_id);
CREATE INDEX idx_payments_date ON payments(payment_date DESC);
