import type { ActiveView } from '../types';

interface HeaderProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
}

export function Header({ activeView, onNavigate }: HeaderProps) {
  return (
    <header className="no-print sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <h1
            className="cursor-pointer font-condensed text-2xl font-bold tracking-tight text-accent"
            onClick={() => onNavigate('form')}
          >
            KVIKTA
          </h1>
          <span className="hidden text-xs text-muted sm:inline">
            AI-driven offert- & fakturahantering
          </span>
        </div>
        <nav className="flex gap-1">
          <button
            onClick={() => onNavigate('form')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeView === 'form'
                ? 'bg-accent text-white'
                : 'text-muted hover:text-text'
            }`}
          >
            Ny offert
          </button>
          <button
            onClick={() => onNavigate('history')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeView === 'history'
                ? 'bg-accent text-white'
                : 'text-muted hover:text-text'
            }`}
          >
            Historik
          </button>
        </nav>
      </div>
    </header>
  );
}
