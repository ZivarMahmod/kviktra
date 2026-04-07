import type { Quote, Invoice } from '../types';
import { fmtSEK } from '../lib/calculations';

type HistoryItem = (Quote & { _type: 'quote' }) | (Invoice & { _type: 'invoice' });

interface HistoryListProps {
  quotes: Quote[];
  invoices: Invoice[];
  onSelect: (item: Quote | Invoice, type: 'quote' | 'invoice') => void;
  onStatusChange: (invoiceId: string, status: Invoice['status']) => void;
}

const statusOptions: Invoice['status'][] = ['Utkast', 'Skickad', 'Betald', 'Förfallen'];

function badgeClass(status: string): string {
  switch (status) {
    case 'Utkast': return 'badge badge-utkast';
    case 'Skickad': return 'badge badge-skickad';
    case 'Betald': return 'badge badge-betald';
    case 'Förfallen': return 'badge badge-forfallen';
    default: return 'badge badge-utkast';
  }
}

export function HistoryList({ quotes, invoices, onSelect, onStatusChange }: HistoryListProps) {
  const allItems: HistoryItem[] = [
    ...invoices.map((inv) => ({ ...inv, _type: 'invoice' as const })),
    ...quotes.map((q) => ({ ...q, _type: 'quote' as const })),
  ];

  if (allItems.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-muted">
        <div className="text-center">
          <p className="text-4xl mb-2">&#128203;</p>
          <p>Inga offerter eller fakturor ännu</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-condensed text-lg font-bold text-accent">Historik</h2>
      <div className="space-y-2">
        {allItems.map((item) => (
          <div
            key={item.doc_number}
            className="card flex cursor-pointer items-center justify-between p-4 transition-colors hover:border-accent/50"
            onClick={() => onSelect(item, item._type)}
          >
            <div className="flex items-center gap-4">
              <span className={`font-mono text-sm font-bold ${
                item._type === 'invoice' ? 'text-accent2' : 'text-accent'
              }`}>
                {item.doc_number}
              </span>
              <div>
                <p className="text-sm font-medium">{item.customer?.name || 'Okänd kund'}</p>
                <p className="text-xs text-muted">{item.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono text-sm">{fmtSEK(item.totals.grandTotal)}</span>
              {item._type === 'invoice' && (
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={(item as Invoice).status}
                    onChange={(e) => onStatusChange(item.id!, e.target.value as Invoice['status'])}
                    className={`${badgeClass((item as Invoice).status)} appearance-none pr-6 cursor-pointer`}
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}
              {item._type === 'quote' && (
                <span className="badge badge-utkast">Offert</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
