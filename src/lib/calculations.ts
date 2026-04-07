import type { LineItem, Totals } from '../types';

export function calcTotals(items: LineItem[], vatRate: number, rotEnabled: boolean): Totals {
  const labourTotal = items
    .filter((item) => item.type === 'arbete')
    .reduce((sum, item) => sum + item.qty * item.unit, 0);

  const materialTotal = items
    .filter((item) => item.type === 'material')
    .reduce((sum, item) => sum + item.qty * item.unit, 0);

  const subtotal = labourTotal + materialTotal;
  const vatAmount = subtotal * (vatRate / 100);
  const totalInclVat = subtotal + vatAmount;

  const labourInclVat = labourTotal * (1 + vatRate / 100);
  const rotAmount = rotEnabled ? Math.min(labourInclVat * 0.3, 50000) : 0;
  const grandTotal = totalInclVat - rotAmount;

  return {
    subtotal,
    labourTotal,
    materialTotal,
    vatAmount,
    totalInclVat,
    rotAmount,
    grandTotal,
  };
}

export function fmtSEK(amount: number): string {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateDocNumber(prefix: string, count: number): string {
  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

export function calcDueDate(dateStr: string, paymentTerms: string): string {
  const date = new Date(dateStr);
  const daysMatch = paymentTerms.match(/(\d+)/);
  const days = daysMatch ? parseInt(daysMatch[1], 10) : 30;
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}
