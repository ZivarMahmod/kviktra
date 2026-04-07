import type { Module } from '../types';

interface SidebarProps {
  active: Module;
  onNavigate: (m: Module) => void;
  counts: { customers: number; quotes: number; invoices: number; jobs: number };
}

const modules: { key: Module; label: string; icon: string }[] = [
  { key: 'dashboard', label: 'Översikt', icon: '&#9632;' },
  { key: 'customers', label: 'Kunder', icon: '&#128101;' },
  { key: 'quotes', label: 'Offerter', icon: '&#128196;' },
  { key: 'invoices', label: 'Fakturor', icon: '&#128179;' },
  { key: 'jobs', label: 'Jobb', icon: '&#128295;' },
];

export function Sidebar({ active, onNavigate, counts }: SidebarProps) {
  const countMap: Record<string, number> = {
    customers: counts.customers,
    quotes: counts.quotes,
    invoices: counts.invoices,
    jobs: counts.jobs,
  };

  return (
    <nav className="no-print flex w-16 flex-col items-center border-r border-border bg-surface py-4 lg:w-56 lg:items-stretch lg:px-3">
      <div className="mb-6 hidden lg:block">
        <h1 className="font-condensed text-xl font-bold tracking-tight text-accent">KVIKTA</h1>
        <p className="text-[10px] text-muted">Affärssystem</p>
      </div>
      <div className="lg:hidden mb-4">
        <span className="font-condensed text-lg font-bold text-accent">K</span>
      </div>

      <div className="flex flex-col gap-1">
        {modules.map((m) => (
          <button
            key={m.key}
            onClick={() => onNavigate(m.key)}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
              active === m.key
                ? 'bg-accent/15 text-accent'
                : 'text-muted hover:bg-surface2 hover:text-text'
            }`}
          >
            <span
              className="text-base w-5 text-center shrink-0"
              dangerouslySetInnerHTML={{ __html: m.icon }}
            />
            <span className="hidden lg:inline flex-1">{m.label}</span>
            {countMap[m.key] > 0 && (
              <span className="hidden lg:inline ml-auto rounded-full bg-surface2 px-1.5 py-0.5 text-[10px] font-bold text-muted">
                {countMap[m.key]}
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
