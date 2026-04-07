import { useState } from 'react';
import type { Quote, Invoice, Email, Module } from './types';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CustomersPage } from './components/CustomersPage';
import { QuotesPage } from './components/QuotesPage';
import { InvoicesPage } from './components/InvoicesPage';
import { JobsPage } from './components/JobsPage';
import { useQuotes } from './hooks/useQuotes';
import { useInvoices } from './hooks/useInvoices';
import { useCustomers } from './hooks/useCustomers';
import { useJobs } from './hooks/useJobs';

function App() {
  const [activeModule, setActiveModule] = useState<Module>('dashboard');

  const { quotes, addQuote, getQuoteCount } = useQuotes();
  const { invoices, createFromQuote, updateStatus } = useInvoices();
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const { jobs, addJob, updateJobStatus } = useJobs();

  const handleQuoteCreated = (quote: Quote, _emails: Email[]) => {
    addQuote(quote);
    // Auto-add customer if new
    if (quote.customer && !customers.find((c) => c.email === quote.customer?.email && c.name === quote.customer?.name)) {
      addCustomer({
        name: quote.customer.name,
        email: quote.customer.email,
        phone: quote.customer.phone || '',
        address: quote.customer.address,
        pnr: quote.customer.pnr,
        notes: '',
      });
    }
  };

  const handleCreateInvoice = (quote: Quote): Invoice => {
    return createFromQuote(quote);
  };

  return (
    <div className="flex h-screen bg-bg">
      <Sidebar
        active={activeModule}
        onNavigate={setActiveModule}
        counts={{
          customers: customers.length,
          quotes: quotes.length,
          invoices: invoices.length,
          jobs: jobs.length,
        }}
      />

      <main className="flex-1 overflow-y-auto">
        {activeModule === 'dashboard' && (
          <div className="p-4 lg:p-6">
            <Dashboard
              quotes={quotes}
              invoices={invoices}
              customers={customers}
              jobs={jobs}
              onNavigate={setActiveModule}
            />
          </div>
        )}

        {activeModule === 'customers' && (
          <CustomersPage
            customers={customers}
            onAdd={addCustomer}
            onUpdate={updateCustomer}
            onDelete={deleteCustomer}
          />
        )}

        {activeModule === 'quotes' && (
          <QuotesPage
            quotes={quotes}
            customers={customers}
            quoteCount={getQuoteCount()}
            onQuoteCreated={handleQuoteCreated}
            onCreateInvoice={handleCreateInvoice}
          />
        )}

        {activeModule === 'invoices' && (
          <InvoicesPage
            invoices={invoices}
            onStatusChange={updateStatus}
          />
        )}

        {activeModule === 'jobs' && (
          <JobsPage
            jobs={jobs}
            customers={customers}
            onAdd={addJob}
            onStatusChange={updateJobStatus}
          />
        )}
      </main>
    </div>
  );
}

export default App;
