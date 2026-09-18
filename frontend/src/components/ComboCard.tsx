import { Link, useNavigate } from 'react-router-dom';
import type { Combo, ComboComponent } from '../types';
import { formatARS, formatKg } from '../lib/utils';
import { getRootGroups, formatComboQty } from '../lib/combo';

export function comboLineSummary(component: ComboComponent): string {
  if (component.dayLabel) return `${component.dayLabel}: ${component.name}`;
  const rootGroups = getRootGroups(component);
  if (component.fixedProductId != null || rootGroups.length === 0) {
    return `${formatComboQty(component.quantity, component.unit)} ${component.name}`;
  }
  const choices = rootGroups[0].options.map((o) => o.name).slice(0, 3).join(' · ');
  const total = rootGroups[0].options.length;
  return `${formatComboQty(component.quantity, component.unit)} ${component.name}${choices ? ` (${choices}${total > 3 ? '…' : ''})` : ''}`;
}

interface ComboCardProps {
  combo: Combo;
}

export default function ComboCard({ combo }: ComboCardProps) {
  const navigate = useNavigate();
  const unavailable = !combo.isActive;

  return (
    <div className={`border border-zinc-200 bg-white flex flex-col group ${unavailable ? 'opacity-60' : ''}`}>
      <Link
        to={`/combos/${combo.slug}`}
        className="h-40 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black flex flex-col items-center justify-center relative overflow-hidden"
      >
        <span className="text-5xl opacity-30">🥩</span>
        <span className="absolute top-2 left-2 rounded bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white tracking-wide">
          COMBO
        </span>
        {combo.freeShipping && (
          <span className="absolute top-2 right-2 rounded bg-black/80 border border-red-500/40 px-2 py-0.5 text-[10px] font-semibold text-red-400 tracking-wide">
            ENVÍO GRATIS
          </span>
        )}
        {combo.variantLabel && (
          <span className="absolute bottom-2 right-2 rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white tracking-widest">
            {combo.variantLabel}
          </span>
        )}
      </Link>

      <div className="p-4 flex-1 flex flex-col gap-2">
        <h3
          className="text-2xl text-zinc-900 leading-tight uppercase tracking-wide"
          style={{ fontFamily: '"Anton", sans-serif', fontWeight: 400 }}
        >
          {combo.name}
        </h3>
        {combo.tagline && <p className="text-xs text-zinc-500 leading-snug">{combo.tagline}</p>}

        <ul className="mt-1 space-y-0.5 text-xs text-zinc-600">
          {combo.components.slice(0, 5).map((comp, i) => (
            <li key={comp.id} className="flex gap-1.5">
              <span className="text-red-500">•</span>
              <span className="leading-snug">{comboLineSummary(comp)}</span>
            </li>
          ))}
          {combo.components.length > 5 && (
            <li className="text-zinc-400">+ {combo.components.length - 5} componentes más</li>
          )}
        </ul>

        <div className="mt-auto pt-3 border-t border-zinc-100">
          <div className="flex items-center justify-between gap-2">
            <span className="text-2xl font-bold text-zinc-900 tabular-nums">{formatARS(combo.price)}</span>
            <span className="text-sm font-semibold text-red-600 tabular-nums">{formatKg(combo.totalKg)}</span>
          </div>
        </div>

        <button
          onClick={() => navigate(`/combos/${combo.slug}`)}
          className="mt-3 w-full py-2.5 font-semibold text-sm tracking-wider uppercase transition-all bg-red-600 hover:bg-red-700 text-white active:scale-[0.98]"
        >
          Armar combo
        </button>
      </div>
    </div>
  );
}