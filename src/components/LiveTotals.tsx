import type { Totals } from '../types';
import { fmtSEK } from '../lib/calculations';

interface LiveTotalsProps {
  totals: Totals;
  rotEnabled: boolean;
  vatRate: number;
}

export function LiveTotals({ totals, rotEnabled, vatRate }: LiveTotalsProps) {
  return (
    <div className="card p-3 space-y-1.5 text-sm font-mono">
      <div className="flex justify-between text-muted">
        <span>Arbete</span>
        <span>{fmtSEK(totals.labourTotal)}</span>
      </div>
      <div className="flex justify-between text-muted">
        <span>Material</span>
        <span>{fmtSEK(totals.materialTotal)}</span>
      </div>
      <div className="border-t border-border my-1" />
      <div className="flex justify-between">
        <span>Netto</span>
        <span>{fmtSEK(totals.subtotal)}</span>
      </div>
      <div className="flex justify-between text-muted">
        <span>Moms ({vatRate}%)</span>
        <span>{fmtSEK(totals.vatAmount)}</span>
      </div>
      <div className="flex justify-between font-semibold">
        <span>Totalt inkl. moms</span>
        <span>{fmtSEK(totals.totalInclVat)}</span>
      </div>
      {rotEnabled && totals.rotAmount > 0 && (
        <>
          <div className="flex justify-between text-success">
            <span>ROT-avdrag (30%)</span>
            <span>-{fmtSEK(totals.rotAmount)}</span>
          </div>
          <div className="border-t border-border my-1" />
          <div className="flex justify-between font-bold text-base">
            <span>Att betala</span>
            <span>{fmtSEK(totals.grandTotal)}</span>
          </div>
        </>
      )}
    </div>
  );
}
