import type { Quote, Invoice } from '../types';

type DocumentType = 'quote' | 'invoice';
import { fmtSEK } from '../lib/calculations';

interface DocumentViewProps {
  document: Quote | Invoice | null;
  type: DocumentType;
  onCreateInvoice?: () => void;
  onPrint?: () => void;
}

function isInvoice(doc: Quote | Invoice): doc is Invoice {
  return 'status' in doc && 'due_date' in doc;
}

export function DocumentView({ document: doc, type, onCreateInvoice, onPrint }: DocumentViewProps) {
  if (!doc) {
    return (
      <div className="flex h-full items-center justify-center text-muted">
        <div className="text-center">
          <p className="text-4xl mb-2">&#128196;</p>
          <p>Skapa en offert för att se den här</p>
        </div>
      </div>
    );
  }

  const isInv = isInvoice(doc);
  const title = isInv ? 'FAKTURA' : 'OFFERT';
  const company = doc.company;
  const customer = doc.customer;
  const totals = doc.totals;

  return (
    <div className="space-y-4">
      <div className="no-print flex items-center justify-between">
        <h2 className="font-condensed text-lg font-bold text-accent">{title}</h2>
        <div className="flex gap-2">
          {type === 'quote' && onCreateInvoice && (
            <button onClick={onCreateInvoice} className="btn-primary text-xs">
              Skapa faktura
            </button>
          )}
          <button onClick={onPrint} className="btn-secondary text-xs">
            Skriv ut / PDF
          </button>
        </div>
      </div>

      <div className="doc-card shadow-lg">
        <div className="doc-header">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-condensed text-2xl font-bold">{company?.name || 'Företag'}</h3>
              <p className="mt-1 text-sm opacity-80">{company?.trade}</p>
            </div>
            <div className="text-right">
              <p className="font-condensed text-xl font-bold">{title}</p>
              <p className="font-mono text-sm">{doc.doc_number}</p>
            </div>
          </div>
        </div>

        <div className="doc-body">
          <div className="mb-6 grid grid-cols-2 gap-8 text-sm">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-gray-500">Från</p>
              <p className="font-semibold">{company?.name}</p>
              <p>{company?.address}</p>
              <p>{company?.phone}</p>
              <p>{company?.email}</p>
              {company?.org_nr && <p className="mt-1 text-xs text-gray-500">Org.nr: {company.org_nr}</p>}
              {company?.f_skatt && <p className="text-xs text-gray-500">Godkänd för F-skatt</p>}
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-gray-500">Till</p>
              <p className="font-semibold">{customer?.name}</p>
              <p>{customer?.address}</p>
              <p>{customer?.email}</p>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-3 gap-4 rounded-md bg-gray-50 p-3 text-sm">
            <div>
              <p className="text-xs text-gray-500">Datum</p>
              <p className="font-medium">{doc.date}</p>
            </div>
            {isInv && (
              <div>
                <p className="text-xs text-gray-500">Förfallodatum</p>
                <p className="font-medium">{(doc as Invoice).due_date}</p>
              </div>
            )}
            {!isInv && (
              <div>
                <p className="text-xs text-gray-500">Giltighet</p>
                <p className="font-medium">{(doc as Quote).validity}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500">Betalningsvillkor</p>
              <p className="font-medium">{doc.payment_terms}</p>
            </div>
          </div>

          {isInv && (doc as Invoice).quote_ref && (
            <p className="mb-4 text-sm text-gray-500">
              Ref. offert: {(doc as Invoice).quote_ref}
            </p>
          )}

          {doc.description && (
            <div className="mb-6">
              <p className="mb-2 text-xs font-semibold uppercase text-gray-500">Arbetsbeskrivning</p>
              <p className="whitespace-pre-line text-sm leading-relaxed">{doc.description}</p>
            </div>
          )}

          <table className="doc-table mb-6">
            <thead>
              <tr>
                <th>Typ</th>
                <th>Beskrivning</th>
                <th className="text-right">Antal</th>
                <th className="text-right">À-pris</th>
                <th className="text-right">Summa</th>
              </tr>
            </thead>
            <tbody>
              {doc.items.map((item, i) => (
                <tr key={i}>
                  <td>
                    <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${
                      item.type === 'arbete'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {item.type === 'arbete' ? 'Arbete' : 'Material'}
                    </span>
                  </td>
                  <td>{item.desc}</td>
                  <td className="text-right">{item.qty}</td>
                  <td className="text-right font-mono">{fmtSEK(item.unit)}</td>
                  <td className="text-right font-mono font-medium">{fmtSEK(item.qty * item.unit)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="ml-auto max-w-xs space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Netto</span>
              <span className="font-mono">{fmtSEK(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Moms ({doc.vat_rate}%)</span>
              <span className="font-mono">{fmtSEK(totals.vatAmount)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-1 font-semibold">
              <span>Totalt inkl. moms</span>
              <span className="font-mono">{fmtSEK(totals.totalInclVat)}</span>
            </div>
            {doc.rot_enabled && totals.rotAmount > 0 && (
              <>
                <div className="flex justify-between text-green-600">
                  <span>ROT-avdrag (30%)</span>
                  <span className="font-mono">-{fmtSEK(totals.rotAmount)}</span>
                </div>
                <div className="flex justify-between border-t-2 border-gray-800 pt-1 text-base font-bold">
                  <span>Att betala</span>
                  <span className="font-mono">{fmtSEK(totals.grandTotal)}</span>
                </div>
              </>
            )}
          </div>

          {isInv && (doc as Invoice).bankgiro && (
            <div className="mt-8 rounded-md bg-gray-50 p-4 text-sm">
              <p className="mb-1 text-xs font-semibold uppercase text-gray-500">Betalningsinformation</p>
              <p>Bankgiro: {(doc as Invoice).bankgiro}</p>
              <p>Referens: {doc.doc_number}</p>
              <p className="mt-2 text-xs text-gray-500">
                Vid försenad betalning debiteras dröjsmålsränta enligt räntelagen.
              </p>
            </div>
          )}

          <div className="mt-8 border-t border-gray-200 pt-4 text-center text-xs text-gray-400">
            <p>{company?.name} | {company?.org_nr} | {company?.email} | {company?.phone}</p>
            {company?.f_skatt && <p>Godkänd för F-skatt</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
