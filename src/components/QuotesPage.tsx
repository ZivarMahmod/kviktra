import { useState } from 'react';
import type { Quote, Invoice, Email, Customer } from '../types';
import { fmtSEK } from '../lib/calculations';
import { QuoteForm } from './QuoteForm';
import { DocumentView } from './DocumentView';
import { EmailCards } from './EmailCards';

interface QuotesPageProps {
  quotes: Quote[];
  customers: Customer[];
  quoteCount: number;
  onQuoteCreated: (quote: Quote, emails: Email[]) => void;
  onCreateInvoice: (quote: Quote) => Invoice;
}

type QuoteView = 'list' | 'new' | 'detail';

export function QuotesPage({ quotes, customers, quoteCount, onQuoteCreated, onCreateInvoice }: QuotesPageProps) {
  const [view, setView] = useState<QuoteView>(quotes.length === 0 ? 'new' : 'list');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [activeTab, setActiveTab] = useState<'document' | 'emails'>('document');
  const [search, setSearch] = useState('');

  const filtered = quotes.filter((q) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return q.doc_number.toLowerCase().includes(s)
      || (q.customer?.name || '').toLowerCase().includes(s);
  });

  const handleQuoteCreated = (quote: Quote, generatedEmails: Email[]) => {
    onQuoteCreated(quote, generatedEmails);
    setSelectedQuote(quote);
    setEmails(generatedEmails);
    setView('detail');
    setActiveTab('document');
  };

  const handleCreateInvoice = () => {
    if (!selectedQuote) return;
    const invoice = onCreateInvoice(selectedQuote);
    // navigate to invoice view would be nice, but for now just show confirmation
    alert(`Faktura ${invoice.doc_number} skapad!`);
  };

  // Detail view
  if (view === 'detail' && selectedQuote) {
    return (
      <div className="flex h-full flex-col lg:flex-row">
        <aside className="w-full shrink-0 border-b border-border p-4 lg:w-72 lg:border-b-0 lg:border-r">
          <button onClick={() => setView('list')} className="btn-secondary mb-4 w-full justify-center">
            &larr; Alla offerter
          </button>
          <button onClick={() => { setView('new'); }} className="btn-primary w-full justify-center mb-4">
            + Ny offert
          </button>

          <div className="card p-3 space-y-2 text-sm mb-4">
            <p className="text-xs text-muted uppercase font-semibold">Vald offert</p>
            <p className="font-mono font-bold text-accent">{selectedQuote.doc_number}</p>
            <p>{selectedQuote.customer?.name}</p>
            <p className="font-mono">{fmtSEK(selectedQuote.totals.grandTotal)}</p>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('document')}
              className={`w-full rounded-md px-3 py-1.5 text-left text-sm ${activeTab === 'document' ? 'bg-accent/15 text-accent' : 'text-muted hover:text-text'}`}
            >
              Dokument
            </button>
            <button
              onClick={() => setActiveTab('emails')}
              className={`w-full rounded-md px-3 py-1.5 text-left text-sm ${activeTab === 'emails' ? 'bg-accent/15 text-accent' : 'text-muted hover:text-text'}`}
            >
              Uppföljningsmejl {emails.length > 0 && `(${emails.length})`}
            </button>
          </div>
        </aside>
        <section className="flex-1 overflow-y-auto p-4 lg:p-6">
          {activeTab === 'document' ? (
            <DocumentView
              document={selectedQuote}
              type="quote"
              onCreateInvoice={handleCreateInvoice}
              onPrint={() => window.print()}
            />
          ) : (
            <EmailCards emails={emails} loading={false} />
          )}
        </section>
      </div>
    );
  }

  // New quote form
  if (view === 'new') {
    return (
      <div className="flex h-full flex-col lg:flex-row">
        <aside className="w-full shrink-0 overflow-y-auto border-b border-border lg:w-[420px] lg:border-b-0 lg:border-r lg:h-full">
          <QuoteForm onQuoteCreated={handleQuoteCreated} quoteCount={quoteCount} customers={customers} />
        </aside>
        <section className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="flex h-full items-center justify-center text-muted">
            <div className="text-center">
              <p className="text-4xl mb-2">&#128196;</p>
              <p>Fyll i formuläret och klicka "Skapa offert"</p>
              <p className="text-xs mt-1">Offerten visas här med AI-genererad beskrivning</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // List view
  return (
    <div className="flex h-full flex-col lg:flex-row">
      <aside className="w-full shrink-0 border-b border-border p-4 lg:w-72 lg:border-b-0 lg:border-r lg:h-full lg:overflow-y-auto">
        <h2 className="font-condensed text-lg font-bold text-accent mb-4">Offerter</h2>

        <input
          type="text"
          placeholder="Sök offert..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3"
        />

        <button onClick={() => setView('new')} className="btn-primary w-full justify-center mb-4">
          + Ny offert
        </button>

        <div className="card p-3 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-muted">Totalt</span>
            <span>{quotes.length} offerter</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Värde</span>
            <span className="font-mono">{fmtSEK(quotes.reduce((s, q) => s + q.totals.grandTotal, 0))}</span>
          </div>
        </div>
      </aside>

      <section className="flex-1 overflow-y-auto p-4 lg:p-6">
        {filtered.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-muted">
            <div className="text-center">
              <p className="text-4xl mb-2">&#128196;</p>
              <p>{quotes.length === 0 ? 'Inga offerter ännu' : 'Inga matchande offerter'}</p>
              <button onClick={() => setView('new')} className="btn-primary mt-3">Skapa din första offert</button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((q) => (
              <button
                key={q.doc_number}
                onClick={() => { setSelectedQuote(q); setView('detail'); }}
                className="card flex w-full items-center justify-between p-4 text-left hover:border-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm font-bold text-accent">{q.doc_number}</span>
                  <div>
                    <p className="text-sm font-medium">{q.customer?.name || 'Okänd kund'}</p>
                    <p className="text-xs text-muted">{q.date}</p>
                  </div>
                </div>
                <span className="font-mono text-sm">{fmtSEK(q.totals.grandTotal)}</span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
