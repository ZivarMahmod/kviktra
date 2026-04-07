export interface Company {
  id?: string;
  user_id?: string;
  name: string;
  trade: string;
  phone: string;
  org_nr: string;
  f_skatt: boolean;
  bankgiro: string;
  email: string;
  address: string;
}

export interface Customer {
  id?: string;
  company_id?: string;
  name: string;
  email: string;
  address: string;
  pnr: string;
}

export interface LineItem {
  id: string;
  type: 'arbete' | 'material';
  desc: string;
  qty: number;
  unit: number;
}

export interface Totals {
  subtotal: number;
  labourTotal: number;
  materialTotal: number;
  vatAmount: number;
  totalInclVat: number;
  rotAmount: number;
  grandTotal: number;
}

export interface Quote {
  id?: string;
  company_id?: string;
  customer_id?: string;
  doc_number: string;
  date: string;
  description: string;
  items: LineItem[];
  vat_rate: number;
  validity: string;
  payment_terms: string;
  rot_enabled: boolean;
  totals: Totals;
  job_notes: string;
  company?: Company;
  customer?: Customer;
  created_at?: string;
}

export interface Invoice {
  id?: string;
  company_id?: string;
  customer_id?: string;
  doc_number: string;
  quote_ref: string;
  date: string;
  due_date: string;
  description: string;
  items: LineItem[];
  vat_rate: number;
  payment_terms: string;
  rot_enabled: boolean;
  totals: Totals;
  status: 'Utkast' | 'Skickad' | 'Betald' | 'Förfallen';
  paid_date: string | null;
  job_notes: string;
  bankgiro: string;
  company?: Company;
  customer?: Customer;
  created_at?: string;
}

export interface Email {
  day: number;
  subject: string;
  body: string;
}

export type DocumentType = 'quote' | 'invoice';
export type ActiveView = 'form' | 'document' | 'emails' | 'history';
