import type { Quote, Invoice, Customer, Job, Module } from '../types';
import { fmtSEK } from '../lib/calculations';

interface DashboardProps {
  quotes: Quote[];
  invoices: Invoice[];
  customers: Customer[];
  jobs: Job[];
  onNavigate: (m: Module) => void;
}

export function Dashboard({ quotes, invoices, customers, jobs, onNavigate }: DashboardProps) {
  const unpaidInvoices = invoices.filter((i) => i.status !== 'Betald');
  const totalUnpaid = unpaidInvoices.reduce((sum, i) => sum + i.totals.grandTotal, 0);
  const totalPaid = invoices
    .filter((i) => i.status === 'Betald')
    .reduce((sum, i) => sum + i.totals.grandTotal, 0);
  const activeJobs = jobs.filter((j) => j.status === 'Pågår' || j.status === 'Planerad');
  const overdueInvoices = invoices.filter((i) => i.status === 'Förfallen');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-condensed text-2xl font-bold text-text">Översikt</h1>
        <p className="text-sm text-muted">Välkommen till Kvikta</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <button onClick={() => onNavigate('customers')} className="card p-4 text-left hover:border-accent/50 transition-colors">
          <p className="text-xs font-semibold uppercase text-muted">Kunder</p>
          <p className="mt-1 font-condensed text-3xl font-bold text-text">{customers.length}</p>
        </button>
        <button onClick={() => onNavigate('quotes')} className="card p-4 text-left hover:border-accent/50 transition-colors">
          <p className="text-xs font-semibold uppercase text-muted">Offerter</p>
          <p className="mt-1 font-condensed text-3xl font-bold text-text">{quotes.length}</p>
        </button>
        <button onClick={() => onNavigate('invoices')} className="card p-4 text-left hover:border-accent/50 transition-colors">
          <p className="text-xs font-semibold uppercase text-muted">Fakturor</p>
          <p className="mt-1 font-condensed text-3xl font-bold text-text">{invoices.length}</p>
        </button>
        <button onClick={() => onNavigate('jobs')} className="card p-4 text-left hover:border-accent/50 transition-colors">
          <p className="text-xs font-semibold uppercase text-muted">Aktiva jobb</p>
          <p className="mt-1 font-condensed text-3xl font-bold text-text">{activeJobs.length}</p>
        </button>
      </div>

      {/* Financial summary */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase text-muted">Att få betalt</p>
          <p className="mt-1 font-mono text-2xl font-bold text-accent2">{fmtSEK(totalUnpaid)}</p>
          <p className="mt-1 text-xs text-muted">{unpaidInvoices.length} obetalda fakturor</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase text-muted">Inbetalat</p>
          <p className="mt-1 font-mono text-2xl font-bold text-success">{fmtSEK(totalPaid)}</p>
          <p className="mt-1 text-xs text-muted">{invoices.filter((i) => i.status === 'Betald').length} betalda</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase text-muted">Förfallna</p>
          <p className="mt-1 font-mono text-2xl font-bold text-danger">{fmtSEK(overdueInvoices.reduce((s, i) => s + i.totals.grandTotal, 0))}</p>
          <p className="mt-1 text-xs text-muted">{overdueInvoices.length} förfallna</p>
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold">Senaste offerter</h3>
          </div>
          <div className="divide-y divide-border">
            {quotes.length === 0 ? (
              <p className="p-4 text-sm text-muted">Inga offerter ännu</p>
            ) : (
              quotes.slice(0, 5).map((q) => (
                <div key={q.doc_number} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-accent">{q.doc_number}</span>
                    <p className="text-sm">{q.customer?.name || '—'}</p>
                  </div>
                  <span className="font-mono text-sm">{fmtSEK(q.totals.grandTotal)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <div className="border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold">Aktiva jobb</h3>
          </div>
          <div className="divide-y divide-border">
            {activeJobs.length === 0 ? (
              <p className="p-4 text-sm text-muted">Inga aktiva jobb</p>
            ) : (
              activeJobs.slice(0, 5).map((j) => (
                <div key={j.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{j.title}</p>
                    <p className="text-xs text-muted">{j.customer?.name || '—'}</p>
                  </div>
                  <span className={`badge ${j.status === 'Pågår' ? 'badge-skickad' : 'badge-utkast'}`}>
                    {j.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
