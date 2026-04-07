import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Company, Customer, LineItem, Quote, Email } from '../types';
import { calcTotals } from '../lib/calculations';
import { validateQuoteForm, type ValidationErrors } from '../lib/validation';
import { LineItems } from './LineItems';
import { LiveTotals } from './LiveTotals';

interface QuoteFormProps {
  onQuoteCreated: (quote: Quote, emails: Email[]) => void;
  quoteCount: number;
  customers?: Customer[];
}

const TRADES = ['VVS', 'El', 'Bygg', 'Måleri', 'Snickeri', 'Tak', 'Mark', 'Plattsättning', 'Övrigt'];

export function QuoteForm({ onQuoteCreated, quoteCount, customers: existingCustomers = [] }: QuoteFormProps) {
  const [company, setCompany] = useState<Company>({
    name: '', trade: 'VVS', phone: '', org_nr: '', f_skatt: true,
    bankgiro: '', email: '', address: '',
  });
  const [customer, setCustomer] = useState<Customer>({
    name: '', email: '', phone: '', address: '', pnr: '', notes: '',
  });
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [jobNotes, setJobNotes] = useState('');
  const [items, setItems] = useState<LineItem[]>([
    { id: uuidv4(), type: 'arbete', desc: '', qty: 0, unit: 0 },
  ]);
  const [vatRate, setVatRate] = useState(25);
  const [rotEnabled, setRotEnabled] = useState(false);
  const [validity, setValidity] = useState('30 dagar');
  const [paymentTerms, setPaymentTerms] = useState('30 dagar netto');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);

  const totals = calcTotals(items, vatRate, rotEnabled);

  const handleSelectCustomer = (id: string) => {
    setSelectedCustomerId(id);
    if (id) {
      const c = existingCustomers.find((c) => c.id === id);
      if (c) {
        setCustomer({ ...c });
      }
    } else {
      setCustomer({ name: '', email: '', phone: '', address: '', pnr: '', notes: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateQuoteForm({
      orgNr: company.org_nr,
      companyEmail: company.email,
      phone: company.phone,
      customerEmail: customer.email,
      jobNotes,
      items,
      rotEnabled,
      pnr: customer.pnr,
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const docNumber = `OFF-${String(quoteCount + 1).padStart(4, '0')}`;
      const today = new Date().toISOString().split('T')[0];
      const validItems = items.filter((i) => i.desc && i.qty > 0 && i.unit > 0);

      let description = '';
      try {
        const descRes = await fetch('/api/generate-description', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trade: company.trade,
            companyName: company.name,
            jobNotes,
            customerName: customer.name,
            address: customer.address,
            items: validItems,
          }),
        });
        if (descRes.ok) {
          const data = await descRes.json();
          description = data.description;
        }
      } catch {
        description = jobNotes;
      }

      const quote: Quote = {
        id: uuidv4(),
        doc_number: docNumber,
        date: today,
        description,
        items: validItems,
        vat_rate: vatRate,
        validity,
        payment_terms: paymentTerms,
        rot_enabled: rotEnabled,
        totals: calcTotals(validItems, vatRate, rotEnabled),
        job_notes: jobNotes,
        company: { ...company },
        customer: { ...customer },
      };

      let emails: Email[] = [];
      try {
        const emailRes = await fetch('/api/generate-emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trade: company.trade,
            companyName: company.name,
            customerName: customer.name,
            jobNotes,
            amount: quote.totals.grandTotal,
            phone: company.phone,
            rotEnabled,
          }),
        });
        if (emailRes.ok) {
          const data = await emailRes.json();
          emails = data.emails;
        }
      } catch {
        // emails remain empty if generation fails
      }

      onQuoteCreated(quote, emails);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-4">
      <h2 className="font-condensed text-lg font-bold text-accent">Ny offert</h2>

      {/* Company section */}
      <fieldset className="space-y-3">
        <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-accent2">
          Företagsuppgifter
        </legend>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label>Företagsnamn</label>
            <input value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} placeholder="AB Rör & Värme" required />
          </div>
          <div>
            <label>Bransch</label>
            <select value={company.trade} onChange={(e) => setCompany({ ...company, trade: e.target.value })}>
              {TRADES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label>Org.nr</label>
            <input value={company.org_nr} onChange={(e) => setCompany({ ...company, org_nr: e.target.value })} placeholder="556000-0000" />
            {errors.orgNr && <p className="error-text">{errors.orgNr}</p>}
          </div>
          <div>
            <label>Telefon</label>
            <input value={company.phone} onChange={(e) => setCompany({ ...company, phone: e.target.value })} placeholder="070-123 45 67" />
            {errors.phone && <p className="error-text">{errors.phone}</p>}
          </div>
        </div>
        <div>
          <label>E-post</label>
          <input type="email" value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} placeholder="info@rorvarme.se" />
          {errors.companyEmail && <p className="error-text">{errors.companyEmail}</p>}
        </div>
        <div>
          <label>Adress</label>
          <input value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} placeholder="Rörgatan 1, 123 45 Stockholm" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label>Bankgiro</label>
            <input value={company.bankgiro} onChange={(e) => setCompany({ ...company, bankgiro: e.target.value })} placeholder="123-4567" />
          </div>
          <div className="flex items-end gap-2 pb-1">
            <input type="checkbox" id="fskatt" checked={company.f_skatt} onChange={(e) => setCompany({ ...company, f_skatt: e.target.checked })} className="!w-4 h-4" />
            <label htmlFor="fskatt" className="!mb-0 cursor-pointer">F-skattsedel</label>
          </div>
        </div>
      </fieldset>

      {/* Customer section */}
      <fieldset className="space-y-3">
        <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-accent2">
          Kunduppgifter
        </legend>
        {existingCustomers.length > 0 && (
          <div>
            <label>Välj befintlig kund</label>
            <select value={selectedCustomerId} onChange={(e) => handleSelectCustomer(e.target.value)}>
              <option value="">Ny kund...</option>
              {existingCustomers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label>Kundnamn</label>
          <input value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} placeholder="Anna Andersson" required />
        </div>
        <div>
          <label>Kundens e-post</label>
          <input type="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} placeholder="anna@email.se" />
          {errors.customerEmail && <p className="error-text">{errors.customerEmail}</p>}
        </div>
        <div>
          <label>Arbetsadress</label>
          <input value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} placeholder="Hemvägen 5, 123 45 Stockholm" />
        </div>
      </fieldset>

      {/* Job notes */}
      <div>
        <label>Jobbanteckningar</label>
        <textarea value={jobNotes} onChange={(e) => setJobNotes(e.target.value)} placeholder="Beskriv jobbet kort..." rows={3} />
        {errors.jobNotes && <p className="error-text">{errors.jobNotes}</p>}
      </div>

      {/* Line items */}
      <LineItems items={items} onChange={setItems} error={errors.items} />

      {/* Settings row */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label>Moms</label>
          <select value={vatRate} onChange={(e) => setVatRate(Number(e.target.value))}>
            <option value={25}>25%</option>
            <option value={12}>12%</option>
            <option value={6}>6%</option>
            <option value={0}>0%</option>
          </select>
        </div>
        <div>
          <label>Giltighet</label>
          <select value={validity} onChange={(e) => setValidity(e.target.value)}>
            <option value="15 dagar">15 dagar</option>
            <option value="30 dagar">30 dagar</option>
            <option value="60 dagar">60 dagar</option>
          </select>
        </div>
        <div>
          <label>Betalning</label>
          <select value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)}>
            <option value="10 dagar netto">10 dagar</option>
            <option value="15 dagar netto">15 dagar</option>
            <option value="30 dagar netto">30 dagar</option>
          </select>
        </div>
      </div>

      {/* ROT toggle */}
      <div className="card p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">ROT-avdrag</p>
            <p className="text-xs text-muted">30% av arbetskostnad inkl. moms, max 50 000 kr</p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input type="checkbox" checked={rotEnabled} onChange={(e) => setRotEnabled(e.target.checked)} className="peer sr-only" />
            <div className="h-6 w-11 rounded-full bg-surface2 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-muted after:transition-all peer-checked:bg-success peer-checked:after:translate-x-full peer-checked:after:bg-white" />
          </label>
        </div>
        {rotEnabled && (
          <div className="mt-3">
            <label>Personnummer (för ROT)</label>
            <input value={customer.pnr} onChange={(e) => setCustomer({ ...customer, pnr: e.target.value })} placeholder="ÅÅÅÅMMDD-NNNN" />
            {errors.pnr && <p className="error-text">{errors.pnr}</p>}
          </div>
        )}
      </div>

      {/* Live totals */}
      <LiveTotals totals={totals} rotEnabled={rotEnabled} vatRate={vatRate} />

      {/* Submit */}
      <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Genererar...
          </>
        ) : (
          'Skapa offert'
        )}
      </button>
    </form>
  );
}
