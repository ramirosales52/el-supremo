import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { combosApi, parseComboError } from '../api/combos';
import { useCart } from '../context/CartContext';
import type { Combo, ComboComponent, ComboOption, ComboSelectionGroup, CartItem } from '../types';
import {
  type Sels,
  getActiveOptions,
  getChildren,
  getRootGroups,
  buildSelectionPayload,
  pruneSelections,
  countMissingSelections,
  getComboAvailability,
  formatComboQty,
} from '../lib/combo';
import { formatARS, formatKg } from '../lib/utils';
import { ChevronLeft, Check, Truck } from 'lucide-react';

export default function ComboDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editKey = searchParams.get('edit');
  const { addCombo, updateCombo, items } = useCart();

  const [combo, setCombo] = useState<Combo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selections, setSelections] = useState<Sels>({});
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  const isEditing = editKey != null;

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setSelections({});
    setQuantity(1);
    combosApi
      .getBySlug(slug)
      .then((c) => {
        setCombo(c);
        if (c) document.title = `${c.name} · El Supremo`;
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // Si venimos a editar una línea del carrito, precargamos sus selecciones.
  useEffect(() => {
    if (!combo || !editKey) return;
    const item = items.find(
      (i): i is Extract<CartItem, { kind: 'combo' }> => i.kind === 'combo' && i.key === editKey,
    );
    if (!item) return;
    const prefill: Sels = {};
    for (const comp of item.options) {
      for (const sel of comp.selections) prefill[sel.groupId] = sel.optionId;
    }
    setSelections(prefill);
    setQuantity(item.quantity);
  }, [combo, editKey, items]);

  const availability = useMemo(() => (combo ? getComboAvailability(combo) : null), [combo]);
  const missing = useMemo(
    () => (combo ? countMissingSelections(combo, selections) : 0),
    [combo, selections],
  );
  const isComplete = combo != null && missing === 0 && availability?.sellable === true;

  const handleSelect = (step: ComboComponent | null, group: ComboSelectionGroup, option: ComboOption | null) => {
    if (!combo || !step) return;
    const optionId = option ? (selections[group.id] === option.id ? null : option.id) : null;
    setSelections((prev) => pruneSelections(combo, prev, group.id, optionId));
    setAddError('');
  };

  const handleAdd = async () => {
    if (!combo || !isComplete || adding) return;
    setAdding(true);
    setAddError('');
    try {
      const options = buildSelectionPayload(combo, selections);
      if (isEditing && editKey) {
        await updateCombo(editKey, combo.id, combo.slug, options, quantity);
      } else {
        await addCombo(combo.id, combo.slug, options, quantity);
      }
      navigate('/carrito');
    } catch (err) {
      setAddError(err instanceof Error ? err.message : parseComboError(err).message);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-5xl px-4 py-14">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-zinc-100 w-1/3" />
            <div className="h-64 bg-zinc-100" />
            <div className="h-6 bg-zinc-100 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!combo) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <h1 className="text-4xl uppercase" style={{ fontFamily: '"Anton", sans-serif', fontWeight: 400 }}>
            Combo no encontrado
          </h1>
          <Link to="/combos" className="mt-4 inline-block font-semibold text-red-600 underline">
            <ChevronLeft className="inline h-4 w-4" /> Volver a combos
          </Link>
        </div>
      </div>
    );
  }

  const notSellable = availability && !availability.sellable;

  const ctaLabel = !isComplete
    ? `Faltan ${missing} ${missing === 1 ? 'elección' : 'elecciones'}`
    : adding
      ? isEditing
        ? 'Guardando…'
        : 'Agregando…'
      : `✓ Combo listo · ${isEditing ? 'Guardar cambios' : 'Agregar'} ${formatARS(combo.price * quantity)}`;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
        <Link to="/combos" className="inline-flex items-center gap-1 text-sm font-semibold text-zinc-500 hover:text-red-600">
          <ChevronLeft className="h-4 w-4" /> Volver a combos
        </Link>
        {isEditing && (
          <div className="mt-3 flex flex-wrap items-center gap-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <span className="font-semibold">✎ Editando una combinación de tu carrito</span>
            <Link to="/carrito" className="underline hover:text-red-900">Cancelar y volver al carrito</Link>
          </div>
        )}

        <div className="mt-4 border-b border-zinc-200 pb-8">
          <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
            <h1
              className="text-5xl md:text-6xl text-zinc-900 uppercase leading-[1.05]"
              style={{ fontFamily: '"Anton", sans-serif', fontWeight: 400 }}
            >
              {combo.name}
            </h1>
            {combo.variantLabel && (
              <span className="rounded bg-zinc-900 px-2 py-1 text-xs font-bold text-white tracking-widest mb-2">
                {combo.variantLabel}
              </span>
            )}
          </div>
          <p className="mt-2 text-zinc-500 text-lg">{combo.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-red-600 tabular-nums">{formatARS(combo.price)}</span>
              <span className="text-base font-semibold text-zinc-500 tabular-nums">{formatKg(combo.totalKg)}</span>
            </div>
            {combo.freeShipping && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1">
                <Truck className="h-3.5 w-3.5" /> Envío gratis incluido
              </span>
            )}
          </div>
        </div>

        {notSellable ? (
          <div className="mt-10 border border-red-200 bg-red-50 p-6 text-center">
            <h2 className="text-xl font-bold text-red-700">Este combo no está disponible por ahora</h2>
            <p className="mt-1 text-sm text-red-600">
              {availability.reasons.map((r) => `"${r.group || r.component}" sin opciones disponibles`).join(' · ')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 mt-10">
            <div className="space-y-10">
              <Steps
                combo={combo}
                selections={selections}
                onSelect={handleSelect}
                isComplete={isComplete}
              />
            </div>

            <aside className="lg:sticky lg:top-24 lg:h-fit">
              <div className="border border-zinc-200 bg-zinc-50 p-5">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Total</span>
                  <span className="text-3xl font-bold text-zinc-900 tabular-nums">
                    {formatARS(combo.price * quantity)}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <span className="text-sm text-zinc-600">Cantidad</span>
                  <div className="flex items-center border border-zinc-300 bg-white">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors text-sm cursor-pointer"
                    >
                      −
                    </button>
                    <span className="px-3 py-1.5 text-sm font-medium text-zinc-900 min-w-[2.5rem] text-center tabular-nums">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="px-3 py-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors text-sm cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAdd}
                  disabled={!isComplete || adding}
                  className={`mt-5 w-full px-4 py-3 font-bold uppercase tracking-wider transition ${
                    !isComplete || adding
                      ? 'cursor-not-allowed bg-zinc-300 text-zinc-500'
                      : 'cursor-pointer bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {ctaLabel}
                </button>
                {addError && <p className="mt-2 text-sm text-red-600 text-center">{addError}</p>}
                <p className="mt-3 text-center text-xs text-zinc-500">Envío gratis · Marcos Juárez</p>
              </div>
            </aside>
          </div>
        )}

        <div className="sticky bottom-4 mt-10 lg:hidden">
          <button
            onClick={handleAdd}
            disabled={!isComplete || adding}
            className={`flex w-full items-center justify-between px-5 py-4 font-bold uppercase tracking-wider transition ${
              !isComplete || adding
                ? 'cursor-not-allowed bg-zinc-300 text-zinc-500'
                : 'cursor-pointer bg-red-600 text-white'
            }`}
          >
            {isComplete ? (
              <>
                <span>{isEditing ? 'Guardar cambios' : 'Agregar combo'} · {formatARS(combo.price * quantity)}</span>
                <span>→</span>
              </>
            ) : (
              <span>Faltan {missing} {missing === 1 ? 'elección' : 'elecciones'}</span>
            )}
          </button>
          {addError && <p className="mt-2 text-sm text-red-600 text-center bg-white px-3 py-2">{addError}</p>}
        </div>
      </div>
    </div>
  );
}

function Steps({
  combo,
  selections,
  onSelect,
  isComplete,
}: {
  combo: Combo;
  selections: Sels;
  onSelect: (step: ComboComponent, group: ComboSelectionGroup, option: ComboOption | null) => void;
  isComplete: boolean;
}) {
  let stepNum = 0;
  return (
    <>
      {combo.components.map((comp) => {
        const rootGroups = getRootGroups(comp);
        const isFixed = comp.fixedProductId != null && rootGroups.length === 0;
        stepNum += 1;
        return (
          <section key={comp.id}>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center bg-zinc-900 text-white" style={{ fontFamily: '"Anton", sans-serif', fontWeight: 400 }}>
                {stepNum}
              </span>
              <h2
                className="text-2xl md:text-3xl text-zinc-900 uppercase"
                style={{ fontFamily: '"Anton", sans-serif', fontWeight: 400 }}
              >
                {formatComboQty(comp.quantity, comp.unit)} {comp.name}
              </h2>
              {comp.dayLabel && (
                <span className="rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white tracking-wide uppercase">
                  {comp.dayLabel}
                </span>
              )}
            </div>

            {isFixed ? (
              <div className="border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
                Incluye <span className="font-semibold text-zinc-900">{comp.fixedProductName ?? 'producto'}</span>
              </div>
            ) : (
              rootGroups.map((group, gi) => (
                <GroupChoices
                  key={`${group.id}-${gi}`}
                  combo={combo}
                  component={comp}
                  group={group}
                  selections={selections}
                  onSelect={onSelect}
                  isComplete={isComplete}
                />
              ))
            )}
          </section>
        );
      })}
    </>
  );
}

function GroupChoices({
  combo,
  component,
  group,
  selections,
  onSelect,
  isComplete,
}: {
  combo: Combo;
  component: ComboComponent;
  group: ComboSelectionGroup;
  selections: Sels;
  onSelect: (step: ComboComponent, group: ComboSelectionGroup, option: ComboOption | null) => void;
  isComplete: boolean;
}) {
  const options = getActiveOptions(group);
  const chosen = selections[group.id];
  const isPrep = group.kind === 'preparation';
  const selectedOption = options.find((o) => o.id === chosen);

  return (
    <div className={isPrep ? 'ml-4 mt-2 border-l-2 border-zinc-200 pl-4' : 'mt-2'}>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">
        {group.name}
        {isPrep && <span className="text-zinc-300 normal-case tracking-normal"> · preparación</span>}
        <span className="text-red-500 ml-1">*</span>
      </p>

      {options.length === 0 ? (
        <p className="text-sm text-red-500">Sin opciones disponibles</p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {options.map((option) => {
            const isSelected = chosen === option.id;
            return (
              <button
                key={option.id}
                onClick={() => onSelect(component, group, option)}
                className={`cursor-pointer flex items-start justify-between gap-3 border-2 p-4 text-left transition ${
                  isSelected
                    ? 'border-red-600 bg-red-50'
                    : 'border-zinc-200 bg-white hover:border-red-400'
                }`}
              >
                <div>
                  <div className="font-semibold text-zinc-900">{option.name}</div>
                  {!isPrep && option.cutOptionName && (
                    <div className="mt-0.5 text-xs text-zinc-500">Corte: {option.cutOptionName}</div>
                  )}
                </div>
                {isSelected && <Check className="h-5 w-5 shrink-0 text-red-600" />}
              </button>
            );
          })}
        </div>
      )}

      {selectedOption &&
        getChildren(component, selectedOption.id).map((child) => (
          <GroupChoices
            key={child.id}
            combo={combo}
            component={component}
            group={child}
            selections={selections}
            onSelect={onSelect}
            isComplete={isComplete}
          />
        ))}

      {!isComplete && chosen == null && (
        <p className="mt-2 text-xs text-red-500">Elegí una opción</p>
      )}
    </div>
  );
}