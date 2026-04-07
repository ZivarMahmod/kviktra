import { v4 as uuidv4 } from 'uuid';
import type { LineItem } from '../types';

interface LineItemsProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  error?: string;
}

export function LineItems({ items, onChange, error }: LineItemsProps) {
  const addRow = () => {
    onChange([...items, { id: uuidv4(), type: 'arbete', desc: '', qty: 0, unit: 0 }]);
  };

  const removeRow = (id: string) => {
    if (items.length <= 1) return;
    onChange(items.filter((item) => item.id !== id));
  };

  const updateRow = (id: string, field: keyof LineItem, value: string | number) => {
    onChange(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="!mb-0">Rader</label>
        <button type="button" onClick={addRow} className="btn-secondary text-xs">
          + Lägg till rad
        </button>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-[90px_1fr_70px_90px_32px] gap-2 items-end"
          >
            <select
              value={item.type}
              onChange={(e) => updateRow(item.id, 'type', e.target.value as 'arbete' | 'material')}
              className="text-xs"
            >
              <option value="arbete">Arbete</option>
              <option value="material">Material</option>
            </select>
            <input
              type="text"
              placeholder="Beskrivning"
              value={item.desc}
              onChange={(e) => updateRow(item.id, 'desc', e.target.value)}
              className="text-xs"
            />
            <input
              type="number"
              placeholder="Antal"
              value={item.qty || ''}
              onChange={(e) => updateRow(item.id, 'qty', Number(e.target.value))}
              className="text-xs text-right"
              min={0}
            />
            <input
              type="number"
              placeholder="À-pris"
              value={item.unit || ''}
              onChange={(e) => updateRow(item.id, 'unit', Number(e.target.value))}
              className="text-xs text-right"
              min={0}
            />
            <button
              type="button"
              onClick={() => removeRow(item.id)}
              className="flex h-[34px] w-8 items-center justify-center rounded-md border border-border text-muted hover:border-danger hover:text-danger"
              title="Ta bort rad"
            >
              x
            </button>
          </div>
        ))}
      </div>

      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
