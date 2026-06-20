import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getProductImageUrl } from '../api/storage';
import { getEffectivePrice } from '../lib/utils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, totalItems, subtotal } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 cursor-pointer" onClick={onClose} />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white border-l border-gray-200 shadow-2xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Carrito ({totalItems})
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            {items.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <span className="text-4xl block mb-3">🛒</span>
                <p className="text-sm">El carrito está vacío</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => {
                  const unitPrice = getEffectivePrice(item.product, item.cutOption?.priceModifier ?? 0);
                  return (
                    <div
                      key={`${item.product.id}-${item.cutOption?.id}`}
                      className="flex gap-3 pb-4 border-b border-gray-200"
                    >
                      <div className="w-14 h-14 bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {item.product.images?.[0] ? (
                          <img
                            src={getProductImageUrl(item.product.images[0])}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl">🥩</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {item.product.name}
                        </p>
                        {item.cutOption && (
                          <p className="text-xs text-gray-500">{item.cutOption.name}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex items-center border border-gray-300">
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.cutOption?.id ?? null, Math.max(0.5, item.quantity - 0.5))
                              }
                              className="px-2 py-0.5 text-gray-500 hover:bg-gray-100 text-xs"
                            >
                              −
                            </button>
                            <span className="px-2 py-0.5 text-xs font-medium text-gray-900">{item.quantity}</span>
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.cutOption?.id ?? null, item.quantity + 0.5)
                              }
                              className="px-2 py-0.5 text-gray-500 hover:bg-gray-100 text-xs"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-xs text-gray-500">
                            ${(unitPrice * item.quantity).toFixed(2)}
                          </span>
                        </div>
                        {item.notes && (
                          <p className="text-xs text-gray-500 mt-0.5">Nota: {item.notes}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id, item.cutOption?.id ?? null)}
                        className="text-gray-400 hover:text-red-600 transition-colors self-start p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t border-gray-200 px-5 py-4 space-y-3">
              <div className="flex justify-between text-base font-semibold text-gray-900">
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <button onClick={handleCheckout} className="w-full py-2.5 font-semibold text-sm bg-red-600 hover:bg-red-700 text-white tracking-wider block text-center">
                Confirmar pedido
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
