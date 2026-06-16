import type { CutOption } from '../types';

interface CutOptionSelectorProps {
  options: CutOption[];
  selected: CutOption | null;
  onSelect: (option: CutOption) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
}

export default function CutOptionSelector({
  options,
  selected,
  onSelect,
  notes,
  onNotesChange,
}: CutOptionSelectorProps) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-400 mb-1.5 block">
        Tipo de corte
      </label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onSelect(opt)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              selected?.id === opt.id
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-surface text-gray-300 border-gray-700 hover:border-primary-600 hover:text-primary-500'
            }`}
          >
            {opt.name}
            {opt.priceModifier != null && opt.priceModifier > 0 && (
              <span className="ml-1 opacity-80">(+${opt.priceModifier})</span>
            )}
          </button>
        ))}
      </div>

      {selected?.requiresNotes && (
        <input
          type="text"
          placeholder="Ej: sin sal, bien cocido..."
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className="input-field mt-2 text-sm"
        />
      )}
    </div>
  );
}
