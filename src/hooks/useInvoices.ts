import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Quote, Invoice } from '../types';
import { calcDueDate } from '../lib/calculations';

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const createFromQuote = useCallback((quote: Quote): Invoice => {
    const invoiceNumber = `FAK-${String(invoices.length + 1).padStart(4, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    const invoice: Invoice = {
      id: uuidv4(),
      doc_number: invoiceNumber,
      quote_ref: quote.doc_number,
      date: today,
      due_date: calcDueDate(today, quote.payment_terms),
      description: quote.description,
      items: [...quote.items],
      vat_rate: quote.vat_rate,
      payment_terms: quote.payment_terms,
      rot_enabled: quote.rot_enabled,
      totals: { ...quote.totals },
      status: 'Utkast',
      paid_date: null,
      job_notes: quote.job_notes,
      bankgiro: quote.company?.bankgiro || '',
      company: quote.company,
      customer: quote.customer,
    };

    setInvoices((prev) => [invoice, ...prev]);
    return invoice;
  }, [invoices.length]);

  const updateStatus = useCallback((id: string, status: Invoice['status']) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? {
              ...inv,
              status,
              paid_date: status === 'Betald' ? new Date().toISOString().split('T')[0] : inv.paid_date,
            }
          : inv
      )
    );
  }, []);

  return { invoices, createFromQuote, updateStatus };
}
