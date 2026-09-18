import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getProductImageUrl } from '../api/storage';
import { getEffectivePrice, CUTOFF_HOUR, formatARS } from '../lib/utils';
import type { CartItem, ComboCartItem, ProductCartItem } from '../types';

export default function Cart() {
  const { items, removeItem, updateQuantity, totalItems, subtotal, clearCart, removedCount, clearRemovedNotice, updateComboQuantity, removeCombo } = useCart();
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 bg-white">
        <div className="text-center max-w-lg mx-auto">
          <span className="text-6xl block mb-4">🛒</span>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h2>
          <p className="text-gray-500 mb-6">Agregá productos o combos desde la tienda</p>
          <Link to="/combos" className="inline-block px-6 py-2.5 font-semibold text-sm bg-red-600 hover:bg-red-700 text-white tracking-wider">
            Ver combos
          </Link>
        </div>
      </div>
    );
  }

  const linePrice = (item: CartItem) => {
    if (item.kind === 'combo') return Number(item.snapshot.price) * item.quantity;
    return getEffectivePrice(item.product, item.cutOption?.priceModifier ?? 0) * item.quantity;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {removedCount > 0 && (
          <div className="mb-6 bg-amber-50 border border-amber-200 p-4 flex items-start justify-between">
            <div className="flex items-start gap-3">
              <span className="text-amber-500 text-lg mt-0.5">⚠️</span>
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Se {removedCount === 1 ? 'removió' : 'removieron'} {removedCount} {removedCount === 1 ? 'artículo que ya no está disponible' : 'artículos que ya no están disponibles'}.
                </p>
              </div>
            </div>
            <button
              onClick={clearRemovedNotice}
              className="text-amber-400 hover:text-amber-600 transition-colors p-1 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Carrito <span className="text-lg text-gray-500 font-normal">({totalItems} {totalItems === 1 ? 'artículo' : 'artículos'})</span>
          </h1>
          <button
            onClick={clearCart}
            className="text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            Vaciar carrito
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) =>
              item.kind === 'combo' ? (
                <ComboLine
                  key={item.key}
                  item={item}
                  expanded={expandedKey === item.key}
                  onToggle={() => setExpandedKey(expandedKey === item.key ? null : item.key)}
                  onRemove={() => removeCombo(item.key)}
                  onQuantity={(q) => updateComboQuantity(item.key, q)}
                />
              ) : (
                <ProductLine
                  key={`${item.product.id}-${item.cutOption?.id}`}
                  item={item}
                  onRemove={() => removeItem(item.product.id, item.cutOption?.id ?? null)}
                  onQuantity={(q) => updateQuantity(item.product.id, item.cutOption?.id ?? null, q)}
                />
              )
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="border border-gray-200 bg-white p-5 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen</h3>

              <div className="space-y-3 text-sm">
                {items.map((item) => (
                  <div key={item.kind === 'combo' ? item.key : `${item.product.id}-${item.cutOption?.id}`} className="flex justify-between">
                    <span className="text-gray-500 truncate mr-2">
                      {item.kind === 'combo' ? item.snapshot.comboName : item.product.name}
                      <span className="text-gray-400"> x{item.quantity}</span>
                    </span>
                    <span className="text-gray-900 font-medium whitespace-nowrap">
                      {formatARS(linePrice(item))}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>{formatARS(subtotal)}</span>
                </div>
                <p className="text-xs text-gray-400">
                  El costo de envío y descuentos se calculan al confirmar el pedido.
                </p>
              </div>

              <Link
                to="/checkout"
                className="block w-full text-center mt-6 py-3 font-semibold text-sm bg-red-600 hover:bg-red-700 text-white tracking-wider"
              >
                Confirmar pedido
              </Link>

              <Link
                to="/combos"
                className="block text-center text-sm text-gray-500 hover:text-gray-900 mt-3 transition-colors"
              >
                Seguir comprando
              </Link>
            </div>

            <div className="border border-amber-200 bg-amber-50 p-4 mt-4">
              <h4 className="text-sm font-semibold text-amber-800 mb-1">Horarios de entrega</h4>
              <p className="text-xs text-amber-700 leading-relaxed">
                Pedidos antes de las {CUTOFF_HOUR}:00 hs → <strong>hoy por la tarde</strong><br />
                Pedidos después de las {CUTOFF_HOUR}:00 hs → <strong>mañana por la tarde</strong>
              </p>
              <p className="text-xs text-amber-600 mt-1">
                En el paso siguiente podés elegir la fecha y franja horaria que prefieras.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductLine({
  item,
  onRemove,
  onQuantity,
}: {
  item: ProductCartItem;
  onRemove: () => void;
  onQuantity: (q: number) => void;
}) {
  const unitPrice = getEffectivePrice(item.product, item.cutOption?.priceModifier ?? 0);

  return (
    <div className="border border-gray-200 bg-white p-4 sm:p-5">
      <div className="flex gap-4">
        <div className="w-20 h-20 bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {item.product.images?.[0] ? (
            <img
              src={getProductImageUrl(item.product.images[0])}
              alt={item.product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-3xl">🥩</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{item.product.name}</h3>
              {item.product.description && (
                <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{item.product.description}</p>
              )}
            </div>
            <button
              onClick={onRemove}
              className="text-gray-400 hover:text-red-600 transition-colors p-1 flex-shrink-0 cursor-pointer"
              title="Eliminar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm">
            <span className="text-gray-500">
              Precio unitario: <span className="text-gray-900 font-medium">{formatARS(unitPrice)}</span>
            </span>
            <span className="text-gray-500">
              Subtotal: <span className="text-gray-900 font-medium">{formatARS(unitPrice * item.quantity)}</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-3">
            <div className="flex items-center border border-gray-300">
              <button
                onClick={() => onQuantity(Math.max(0.5, item.quantity - 0.5))}
                className="px-3 py-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors text-sm"
              >
                −
              </button>
              <span className="px-3 py-1.5 text-sm font-medium text-gray-900 min-w-[3rem] text-center tabular-nums">
                {item.quantity}
              </span>
              <button
                onClick={() => onQuantity(item.quantity + 0.5)}
                className="px-3 py-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors text-sm"
              >
                +
              </button>
            </div>

            <span className="text-sm text-gray-500">{item.product.unit}</span>

            {item.cutOption && (
              <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2.5 py-1">
                {item.cutOption.name}
                {Number(item.cutOption.priceModifier) > 0 && (
                  <span className="text-red-500">(+{formatARS(Number(item.cutOption.priceModifier))})</span>
                )}
              </span>
            )}
          </div>

          {item.notes && (
            <div className="mt-2 text-sm text-gray-500 bg-gray-100 px-3 py-2">
              <span className="text-gray-600">Nota:</span> {item.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ComboLine({
  item,
  expanded,
  onToggle,
  onRemove,
  onQuantity,
}: {
  item: ComboCartItem;
  expanded: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onQuantity: (q: number) => void;
}) {
  const price = Number(item.snapshot.price);

  return (
    <div className="border border-gray-200 bg-white p-4 sm:p-5">
      <div className="flex gap-4">
        <div className="w-20 h-20 bg-zinc-900 flex items-center justify-center flex-shrink-0 overflow-hidden">
          <span className="text-3xl">🥩</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link to={`/combos/${item.slug}`} className="text-lg font-semibold text-gray-900 hover:text-red-600">
                {item.snapshot.comboName}
              </Link>
              <span className="inline-block mt-0.5 ml-2 align-middle rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">Combo</span>
              {item.snapshot.freeShipping && (
                <span className="inline-block mt-0.5 ml-1 align-middle rounded bg-green-50 border border-green-200 px-1.5 py-0.5 text-[10px] font-semibold text-green-700 uppercase">
                  Envío gratis
                </span>
              )}
            </div>
            <button
              onClick={onRemove}
              className="text-gray-400 hover:text-red-600 transition-colors p-1 flex-shrink-0 cursor-pointer"
              title="Eliminar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {formatARS(price)} · {' '}
            {item.snapshot.components.map((c) => c.productName ?? c.name).filter(Boolean).join(', ')}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-3">
            <div className="flex items-center border border-gray-300">
              <button
                onClick={() => onQuantity(Math.max(1, item.quantity - 1))}
                className="px-3 py-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors text-sm"
              >
                −
              </button>
              <span className="px-3 py-1.5 text-sm font-medium text-gray-900 min-w-[3rem] text-center tabular-nums">
                {item.quantity}
              </span>
              <button
                onClick={() => onQuantity(item.quantity + 1)}
                className="px-3 py-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors text-sm"
              >
                +
              </button>
            </div>

            <span className="text-sm text-gray-500">combo</span>

            <span className="text-sm text-gray-500">
              Subtotal: <span className="text-gray-900 font-medium">{formatARS(price * item.quantity)}</span>
            </span>
          </div>

          <button
            onClick={onToggle}
            className="mt-2 text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
          >
            {expanded ? 'Ocultar detalle ▲' : 'Ver detalle ▼'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 border-t border-gray-200 pt-3 space-y-2">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Contenido del combo</h4>
          {item.snapshot.components.map((comp) => (
            <div key={comp.componentId} className="border border-gray-100 bg-gray-50 p-3">
              <p className="text-sm font-semibold text-gray-900">
                {comp.dayLabel && <span className="text-red-600 mr-1">{comp.dayLabel} · </span>}
                {comp.name}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {comp.productName}
                {comp.selections.length > 0 && (
                  <span className="text-gray-400"> — {comp.selections.map((s) => s.optionName).join(' · ')}</span>
                )}
              </p>
            </div>
          ))}
          <Link
            to={`/combos/${item.slug}?edit=${encodeURIComponent(item.key)}`}
            className="inline-block mt-1 text-sm font-semibold text-red-600 hover:underline"
          >
            Editar combinación →
          </Link>
        </div>
      )}
    </div>
  );
}