import { useState } from 'react';
import type { Quote, Invoice, Email, ActiveView, DocumentType } from './types';
import { Header } from './components/Header';
import { QuoteForm } from './components/QuoteForm';
import { DocumentView } from './components/DocumentView';
import { EmailCards } from './components/EmailCards';
import { HistoryList } from './components/HistoryList';
import { useQuotes } from './hooks/useQuotes';
import { useInvoices } from './hooks/useInvoices';

function App() {
  const [activeView, setActiveView] = useState<ActiveView>('form');
  const [activeTab, setActiveTab] = useState<'document' | 'emails'>('document');
  const [currentDoc, setCurrentDoc] = useState<Quote | Invoice | null>(null);
  const [currentDocType, setCurrentDocType] = useState<DocumentType>('quote');
  const [emails, setEmails] = useState<Email[]>([]);
  const [emailsLoading, setEmailsLoading] = useState(false);

  const { quotes, addQuote, getQuoteCount } = useQuotes();
  const { invoices, createFromQuote, updateStatus } = useInvoices();

  const handleQuoteCreated = (quote: Quote, generatedEmails: Email[]) => {
    addQuote(quote);
    setCurrentDoc(quote);
    setCurrentDocType('quote');
    setActiveTab('document');
    setEmails(generatedEmails);
    setEmailsLoading(false);
  };

  const handleCreateInvoice = () => {
    if (!currentDoc || currentDocType !== 'quote') return;
    const invoice = createFromQuote(currentDoc as Quote);
    setCurrentDoc(invoice);
    setCurrentDocType('invoice');
  };

  const handleSelectHistoryItem = (item: Quote | Invoice, type: 'quote' | 'invoice') => {
    setCurrentDoc(item);
    setCurrentDocType(type);
    setActiveView('form');
    setActiveTab('document');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-bg">
      <Header activeView={activeView} onNavigate={setActiveView} />

      {activeView === 'history' ? (
        <main className="mx-auto max-w-4xl p-4">
          <HistoryList
            quotes={quotes}
            invoices={invoices}
            onSelect={handleSelectHistoryItem}
            onStatusChange={updateStatus}
          />
        </main>
      ) : (
        <main className="mx-auto flex max-w-7xl flex-col lg:flex-row">
          {/* Left panel — form */}
          <aside className="no-print w-full shrink-0 overflow-y-auto border-r border-border lg:w-[420px] lg:h-[calc(100vh-57px)] lg:sticky lg:top-[57px]">
            <QuoteForm
              onQuoteCreated={handleQuoteCreated}
              quoteCount={getQuoteCount()}
            />
          </aside>

          {/* Right panel — output */}
          <section className="flex-1 p-4 lg:p-6">
            {/* Tabs */}
            <div className="no-print mb-4 flex gap-1 border-b border-border">
              <button
                onClick={() => setActiveTab('document')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'document'
                    ? 'border-b-2 border-accent text-accent'
                    : 'text-muted hover:text-text'
                }`}
              >
                Dokument
              </button>
              <button
                onClick={() => setActiveTab('emails')}
                className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'emails'
                    ? 'border-b-2 border-accent text-accent'
                    : 'text-muted hover:text-text'
                }`}
              >
                Uppföljningsmejl
                {emails.length > 0 && (
                  <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-accent2 text-[10px] font-bold text-black">
                    {emails.length}
                  </span>
                )}
              </button>
            </div>

            {activeTab === 'document' ? (
              <DocumentView
                document={currentDoc}
                type={currentDocType}
                onCreateInvoice={currentDocType === 'quote' ? handleCreateInvoice : undefined}
                onPrint={handlePrint}
              />
            ) : (
              <EmailCards emails={emails} loading={emailsLoading} />
            )}
          </section>
        </main>
      )}
    </div>
  );
}

export default App;
