import { useState } from 'react';
import type { Job, JobStatus, Customer } from '../types';

interface JobsPageProps {
  jobs: Job[];
  customers: Customer[];
  onAdd: (job: Omit<Job, 'id' | 'created_at'>) => void;
  onStatusChange: (id: string, status: JobStatus) => void;
}

const statusFilters: (JobStatus | 'Alla')[] = ['Alla', 'Planerad', 'Pågår', 'Klar', 'Fakturerad'];
const statusColors: Record<JobStatus, string> = {
  'Planerad': 'badge badge-utkast',
  'Pågår': 'badge badge-skickad',
  'Klar': 'badge badge-betald',
  'Fakturerad': 'badge badge-forfallen',
};

export function JobsPage({ jobs, customers, onAdd, onStatusChange }: JobsPageProps) {
  const [filter, setFilter] = useState<JobStatus | 'Alla'>('Alla');
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const filtered = jobs.filter((j) => filter === 'Alla' || j.status === filter);

  const handleAdd = () => {
    if (!title.trim()) return;
    const customer = customers.find((c) => c.id === customerId);
    onAdd({
      customer_id: customerId,
      customer,
      title,
      description: desc,
      status: 'Planerad',
      start_date: startDate,
    });
    setTitle('');
    setDesc('');
    setCustomerId('');
    setShowForm(false);
  };

  return (
    <div className="flex h-full flex-col lg:flex-row">
      {/* Left panel */}
      <aside className="w-full shrink-0 border-b border-border p-4 lg:w-72 lg:border-b-0 lg:border-r lg:h-full lg:overflow-y-auto">
        <h2 className="font-condensed text-lg font-bold text-accent mb-4">Jobb</h2>

        <button onClick={() => setShowForm(!showForm)} className="btn-primary w-full justify-center mb-4">
          + Nytt jobb
        </button>

        <div className="space-y-1 mb-4">
          <p className="text-xs font-semibold uppercase text-muted mb-1.5">Status</p>
          {statusFilters.map((s) => {
            const count = s === 'Alla' ? jobs.length : jobs.filter((j) => j.status === s).length;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-1.5 text-sm transition-colors ${
                  filter === s ? 'bg-accent/15 text-accent' : 'text-muted hover:text-text'
                }`}
              >
                <span>{s}</span>
                <span className="text-xs">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="card p-3 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-muted">Aktiva</span>
            <span>{jobs.filter((j) => j.status === 'Pågår').length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Planerade</span>
            <span>{jobs.filter((j) => j.status === 'Planerad').length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Klara</span>
            <span>{jobs.filter((j) => j.status === 'Klar' || j.status === 'Fakturerad').length}</span>
          </div>
        </div>
      </aside>

      {/* Right panel */}
      <section className="flex-1 overflow-y-auto p-4 lg:p-6">
        {showForm && (
          <div className="mx-auto mb-6 max-w-lg card p-4 space-y-3">
            <h3 className="font-condensed text-base font-bold">Nytt jobb</h3>
            <div>
              <label>Titel</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="T.ex. Renovering badrum Andersson" />
            </div>
            <div>
              <label>Kund</label>
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="">Välj kund...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {customers.length === 0 && <p className="text-xs text-muted mt-1">Lägg till kunder i Kunder-fliken först</p>}
            </div>
            <div>
              <label>Startdatum</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <label>Beskrivning</label>
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} placeholder="Beskriv jobbet..." />
            </div>
            <div className="flex gap-3">
              <button onClick={handleAdd} className="btn-primary">Skapa</button>
              <button onClick={() => setShowForm(false)} className="btn-secondary">Avbryt</button>
            </div>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-muted">
            <div className="text-center">
              <p className="text-4xl mb-2">&#128295;</p>
              <p>{jobs.length === 0 ? 'Inga jobb ännu — skapa ditt första!' : 'Inga matchande jobb'}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((j) => (
              <div key={j.id} className="card p-4 hover:border-accent/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{j.title}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {j.customer?.name || '—'} · Start: {j.start_date}
                      {j.end_date && ` · Klar: ${j.end_date}`}
                    </p>
                    {j.description && <p className="text-sm text-muted mt-1">{j.description}</p>}
                    {j.quote_ref && <p className="text-xs text-accent mt-1">Offert: {j.quote_ref}</p>}
                    {j.invoice_ref && <p className="text-xs text-accent2 mt-0.5">Faktura: {j.invoice_ref}</p>}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <select
                      value={j.status}
                      onChange={(e) => onStatusChange(j.id, e.target.value as JobStatus)}
                      className={`${statusColors[j.status]} appearance-none pr-6 cursor-pointer text-xs`}
                    >
                      {(['Planerad', 'Pågår', 'Klar', 'Fakturerad'] as JobStatus[]).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
