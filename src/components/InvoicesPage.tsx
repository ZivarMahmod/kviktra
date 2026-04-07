import { useState } from 'react';
import type { Invoice, InvoiceStatus } from '../types';
import { fmtSEK } from '../lib/calculations';
import { DocumentView } from './DocumentView';

interface InvoicesPageProps {
  invoices: Invoice[];
  onStatusChange: (id: string, status: InvoiceStatus) => void;
}

const statusFilters: (InvoiceStatus | 'Alla')[] = ['Alla', 'Utkast', 'Skickad', 'Betald', 'Förfallen'];

function badgeClass(status: string): string {
  switch (status) {
    case 'Utkast': return 'badge badge-utkast';
    case 'Skickad': return 'badge badge-skickad';
    case 'Betald': return 'badge badge-betald';
    case 'Förfallen': return 'badge badge-forfallen';
    default: return 'badge badge-utkast';
  }
}

export function InvoicesPage({ invoices, onStatusChange }: InvoicesPageProps) {
  const [filter, setFilter] = useState<InvoiceStatus | 'Alla'>('Alla');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Invoice | null>(null);

  const filtered = invoices.filter((inv) => {
    if (filter !== 'Alla' && inv.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return inv.doc_number.toLowerCase().includes(q)
        || (inv.customer?.name || '').toLowerCase().includes(q);
    }
    return true;
  });

  const totalByStatus = (s: InvoiceStatus) =>
    invoices.filter((i) => i.status === s).reduce((sum, i) => sum + i.totals.grandTotal, 0);

  if (selected) {
    return (
      <div className="flex h-full flex-col lg:flex-row">
        <aside className="w-full shrink-0 border-b border-border p-4 lg:w-72 lg:border-b-0 lg:border-r">
          <button onClick={() => setSelected(null)} className="btn-secondary mb-4 w-full justify-center">
            &larr; Tillbaka till lista
          </button>
          <div className="space-y-3">
            <div className="card p-3">
              <p className="text-xs text-muted uppercase font-semibold mb-1">Status</p>
              <div className="flex flex-wrap gap-1.5">
                {(['Utkast', 'Skickad', 'Betald', 'Förfallen'] as InvoiceStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => { onStatusChange(selected.id!, s); setSelected({ ...selected, status: s }); }}
                    className={`${badgeClass(s)} ${selected.status === s ? 'ring-2 ring-accent' : 'opacity-50'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="card p-3 text-sm">
              <p className="text-xs text-muted uppercase font-semibold mb-1">Detaljer</p>
              <p>Kund: {selected.customer?.name || '—'}</p>
              <p>Datum: {selected.date}</p>
              <p>Förfaller: {selected.due_date}</p>
              {selected.quote_ref && <p>Offertref: {selected.quote_ref}</p>}
            </div>
          </div>
        </aside>
        <section className="flex-1 overflow-y-auto p-4 lg:p-6">
          <DocumentView document={selected} type="invoice" onPrint={() => window.print()} />
        </section>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col lg:flex-row">
      {/* Left panel — filters */}
      <aside className="w-full shrink-0 border-b border-border p-4 lg:w-72 lg:border-b-0 lg:border-r lg:h-full lg:overflow-y-auto">
        <h2 className="font-condensed text-lg font-bold text-accent mb-4">Fakturor</h2>

        <input
          type="text"
          placeholder="Sök faktura..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3"
        />

        <div className="space-y-1 mb-4">
          <p className="text-xs font-semibold uppercase text-muted mb-1.5">Filter</p>
          {statusFilters.map((s) => {
            const count = s === 'Alla' ? invoices.length : invoices.filter((i) => i.status === s).length;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-1.5 text-sm transition-colors ${
                  filter === s ? 'bg-accent/15 text-accent' : 'text-muted hover:text-text'
                }`}
              >
                <span>{s}</span>
                <span className="text-xs">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="card p-3 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted">Obetalda</span>
            <span className="font-mono text-accent2">{fmtSEK(totalByStatus('Skickad') + totalByStatus('Utkast'))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Förfallna</span>
            <span className="font-mono text-danger">{fmtSEK(totalByStatus('Förfallen'))}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2">
            <span className="text-muted">Betalda</span>
            <span className="font-mono text-success">{fmtSEK(totalByStatus('Betald'))}</span>
          </div>
        </div>
      </aside>

      {/* Right panel — list */}
      <section className="flex-1 overflow-y-auto p-4 lg:p-6">
        {filtered.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-muted">
            <div className="text-center">
              <p className="text-4xl mb-2">&#128179;</p>
              <p>{invoices.length === 0 ? 'Inga fakturor ännu' : 'Inga matchande fakturor'}</p>
              <p className="text-xs mt-1">Skapa fakturor från en offert i Offerter-modulen</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((inv) => (
              <button
                key={inv.id}
                onClick={() => setSelected(inv)}
                className="card flex w-full items-center justify-between p-4 text-left hover:border-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm font-bold text-accent2">{inv.doc_number}</span>
                  <div>
                    <p className="text-sm font-medium">{inv.customer?.name || 'Okänd kund'}</p>
                    <p className="text-xs text-muted">{inv.date} · Förfaller {inv.due_date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm">{fmtSEK(inv.totals.grandTotal)}</span>
                  <span className={badgeClass(inv.status)}>{inv.status}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
