-- Kvikta Database Schema
-- Companies, Customers, Quotes, Invoices

-- Companies table
CREATE TABLE companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  trade text,
  phone text,
  org_nr text,
  f_skatt boolean DEFAULT true,
  bankgiro text,
  email text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Customers table
CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text,
  address text,
  pnr text, -- personnummer, encrypted at app level
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Quotes table
CREATE TABLE quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  doc_number text UNIQUE NOT NULL,
  date date DEFAULT CURRENT_DATE,
  description text,
  items jsonb DEFAULT '[]'::jsonb,
  vat_rate integer DEFAULT 25,
  validity text DEFAULT '30 dagar',
  payment_terms text DEFAULT '30 dagar netto',
  rot_enabled boolean DEFAULT false,
  totals jsonb DEFAULT '{}'::jsonb,
  job_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Invoices table
CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  doc_number text UNIQUE NOT NULL,
  quote_ref text,
  date date DEFAULT CURRENT_DATE,
  due_date date,
  description text,
  items jsonb DEFAULT '[]'::jsonb,
  vat_rate integer DEFAULT 25,
  payment_terms text DEFAULT '30 dagar netto',
  rot_enabled boolean DEFAULT false,
  totals jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'Utkast' CHECK (status IN ('Utkast', 'Skickad', 'Betald', 'Förfallen')),
  paid_date date,
  job_notes text,
  bankgiro text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Companies: users can only access their own
CREATE POLICY "Users can manage own companies" ON companies
  FOR ALL USING (auth.uid() = user_id);

-- Customers: users can access customers belonging to their companies
CREATE POLICY "Users can manage own customers" ON customers
  FOR ALL USING (
    company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
  );

-- Quotes: users can access quotes belonging to their companies
CREATE POLICY "Users can manage own quotes" ON quotes
  FOR ALL USING (
    company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
  );

-- Invoices: users can access invoices belonging to their companies
CREATE POLICY "Users can manage own invoices" ON invoices
  FOR ALL USING (
    company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
  );

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
