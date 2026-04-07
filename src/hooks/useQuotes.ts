import { useState, useCallback } from 'react';
import type { Quote } from '../types';

export function useQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);

  const addQuote = useCallback((quote: Quote) => {
    setQuotes((prev) => [quote, ...prev]);
  }, []);

  const getQuoteCount = useCallback(() => quotes.length, [quotes]);

  return { quotes, addQuote, getQuoteCount };
}
