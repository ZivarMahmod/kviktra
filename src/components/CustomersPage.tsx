import { useState } from 'react';
import type { Customer } from '../types';

interface CustomersPageProps {
  customers: Customer[];
  onAdd: (customer: Omit<Customer, 'id' | 'created_at'>) => Customer;
  onUpdate: (id: string, updates: Partial<Customer>) => void;
  onDelete: (id: string) => void;
}

const emptyCustomer = (): Omit<Customer, 'id' | 'created_at'> => ({
  name: '', email: '', phone: '', address: '', pnr: '', notes: '',
});

export function CustomersPage({ customers, onAdd, onUpdate, onDelete }: CustomersPageProps) {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState(emptyCustomer());

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.address.toLowerCase().includes(q);
  });

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editing) {
      onUpdate(editing.id!, form);
      setEditing(null);
    } else {
      onAdd(form);
    }
    setForm(emptyCustomer());
    setShowForm(false);
  };

  const startEdit = (c: Customer) => {
    setEditing(c);
    setForm({ name: c.name, email: c.email, phone: c.phone, address: c.address, pnr: c.pnr, notes: c.notes });
    setShowForm(true);
  };

  const cancel = () => {
    setShowForm(false);
    setEditing(null);
    setForm(emptyCustomer());
  };

  return (
    <div className="flex h-full flex-col lg:flex-row">
      {/* Left panel — filter & actions */}
      <aside className="w-full shrink-0 border-b border-border p-4 lg:w-72 lg:border-b-0 lg:border-r lg:h-full lg:overflow-y-auto">
        <h2 className="font-condensed text-lg font-bold text-accent mb-4">Kunder</h2>

        <input
          type="text"
          placeholder="Sök kund..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3"
        />

        <button onClick={() => { setShowForm(true); setEditing(null); setForm(emptyCustomer()); }} className="btn-primary w-full justify-center mb-4">
          + Ny kund
        </button>

        <div className="space-y-1 text-xs text-muted">
          <p>{customers.length} kunder totalt</p>
          {search && <p>{filtered.length} matchande</p>}
        </div>
      </aside>

      {/* Right panel */}
      <section className="flex-1 overflow-y-auto p-4 lg:p-6">
        {showForm ? (
          <div className="mx-auto max-w-lg space-y-4">
            <h3 className="font-condensed text-lg font-bold">{editing ? 'Redigera kund' : 'Ny kund'}</h3>
            <div>
              <label>Namn</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Anna Andersson" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label>E-post</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="anna@email.se" />
              </div>
              <div>
                <label>Telefon</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="070-123 45 67" />
              </div>
            </div>
            <div>
              <label>Adress</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Hemvägen 5, 123 45 Stockholm" />
            </div>
            <div>
              <label>Personnummer (för ROT)</label>
              <input value={form.pnr} onChange={(e) => setForm({ ...form, pnr: e.target.value })} placeholder="ÅÅÅÅMMDD-NNNN" />
            </div>
            <div>
              <label>Anteckningar</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Interna anteckningar om kunden..." />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={handleSave} className="btn-primary">{editing ? 'Spara' : 'Lägg till'}</button>
              <button type="button" onClick={cancel} className="btn-secondary">Avbryt</button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-muted">
            <div className="text-center">
              <p className="text-4xl mb-2">&#128101;</p>
              <p>{customers.length === 0 ? 'Inga kunder ännu — lägg till din första!' : 'Inga matchande kunder'}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((c) => (
              <div key={c.id} className="card flex items-center justify-between p-4 hover:border-accent/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{c.name}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted mt-0.5">
                    {c.email && <span>{c.email}</span>}
                    {c.phone && <span>{c.phone}</span>}
                    {c.address && <span className="truncate max-w-48">{c.address}</span>}
                  </div>
                </div>
                <div className="flex gap-2 ml-4 shrink-0">
                  <button onClick={() => startEdit(c)} className="btn-secondary text-xs">Redigera</button>
                  <button onClick={() => onDelete(c.id!)} className="btn-secondary text-xs text-danger hover:border-danger">Ta bort</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
