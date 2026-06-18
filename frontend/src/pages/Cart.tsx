import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getProductImageUrl } from '../api/storage';
import { getEffectivePrice } from '../lib/utils';

export default function Cart() {
  const { items, removeItem, updateQuantity, totalItems, subtotal, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 bg-white">
        <div className="text-center max-w-lg mx-auto">
          <span className="text-6xl block mb-4">🛒</span>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h2>
          <p className="text-gray-500 mb-6">Agregá productos desde la tienda</p>
          <Link to="/productos" className="inline-block px-6 py-2.5 font-semibold text-sm bg-red-600 hover:bg-red-700 text-white tracking-wider">
            Ir a la tienda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Carrito <span className="text-lg text-gray-500 font-normal">({totalItems} {totalItems === 1 ? 'producto' : 'productos'})</span>
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
            {items.map((item) => {
              const unitPrice = getEffectivePrice(item.product, item.cutOption?.priceModifier ?? 0);

              return (
                <div
                  key={`${item.product.id}-${item.cutOption?.id}`}
                  className="border border-gray-200 bg-white p-4 sm:p-5"
                >
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.product.image ? (
                        <img
                          src={getProductImageUrl(item.product.image)}
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
                          <h3 className="text-lg font-semibold text-gray-900">
                            {item.product.name}
                          </h3>
                          {item.product.description && (
                            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                              {item.product.description}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.product.id, item.cutOption?.id ?? null)}
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
                          Precio unitario: <span className="text-gray-900 font-medium">${unitPrice.toFixed(2)}</span>
                        </span>
                        <span className="text-gray-500">
                          Subtotal: <span className="text-gray-900 font-medium">${(unitPrice * item.quantity).toFixed(2)}</span>
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        <div className="flex items-center border border-gray-300">
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.cutOption?.id ?? null, Math.max(0.5, item.quantity - 0.5))
                            }
                            className="px-3 py-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors text-sm"
                          >
                            −
                          </button>
                          <span className="px-3 py-1.5 text-sm font-medium text-gray-900 min-w-[3rem] text-center tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.cutOption?.id ?? null, item.quantity + 0.5)
                            }
                            className="px-3 py-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors text-sm"
                          >
                            +
                          </button>
                        </div>

                        <span className="text-sm text-gray-500">
                          {item.product.unit}
                        </span>

                        {item.cutOption && (
                          <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2.5 py-1">
                            {item.cutOption.name}
                            {Number(item.cutOption.priceModifier) > 0 && (
                              <span className="text-red-500">(+${Number(item.cutOption.priceModifier).toFixed(2)})</span>
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
            })}
          </div>

          <div className="lg:col-span-1">
            <div className="border border-gray-200 bg-white p-5 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen</h3>

              <div className="space-y-3 text-sm">
                {items.map((item) => {
                  const unitPrice = getEffectivePrice(item.product, item.cutOption?.priceModifier ?? 0);
                  return (
                    <div key={`${item.product.id}-${item.cutOption?.id}`} className="flex justify-between">
                      <span className="text-gray-500 truncate mr-2">
                        {item.product.name}
                        {item.cutOption && ` (${item.cutOption.name})`}
                        <span className="text-gray-400"> x{item.quantity}</span>
                      </span>
                      <span className="text-gray-900 font-medium whitespace-nowrap">
                        ${(unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
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
                to="/productos"
                className="block text-center text-sm text-gray-500 hover:text-gray-900 mt-3 transition-colors"
              >
                Seguir comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
