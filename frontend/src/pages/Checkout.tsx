import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ordersApi } from '../api/orders';

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (items.length === 0 && !success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <span className="text-5xl block mb-4">🛒</span>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Tu carrito está vacío</h2>
        <p className="text-gray-500 mb-6">Agregá productos desde la tienda</p>
        <button onClick={() => navigate('/')} className="px-6 py-2.5 font-semibold text-sm bg-red-600 hover:bg-red-700 text-white tracking-wider">
          Ir a la tienda
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <div className="max-w-lg mx-auto px-4 text-center">
          <span className="text-6xl block mb-4">✅</span>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pedido confirmado</h2>
          <p className="text-gray-500 mb-6">
            Recibimos tu pedido. Te vamos a contactar para confirmar.
          </p>
          <button onClick={() => navigate('/')} className="px-6 py-2.5 font-semibold text-sm bg-red-600 hover:bg-red-700 text-white tracking-wider">
            Seguir comprando
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      setError('Completá nombre, teléfono y dirección');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await ordersApi.create({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim() || undefined,
        notes: notes.trim() || undefined,
        items: items.map((item) => {
          const modifier = item.cutOption?.priceModifier ?? 0;
          const unitPrice = Number(item.product.basePrice) + Number(modifier);
          return {
            productId: item.product.id,
            quantity: item.quantity,
            unit: item.product.unit,
            unitPrice,
            cutOptionId: item.cutOption?.id,
            notes: item.notes || undefined,
          };
        }),
      });
      setSuccess(true);
      clearCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el pedido');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Confirmar pedido</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-5">
            <div className="border border-gray-200 bg-white p-5 space-y-4">
              <h3 className="font-semibold text-gray-900">Tus datos</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="border border-gray-300 px-3 py-2 text-sm w-full bg-white text-gray-900"
                  placeholder="Tu nombre"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="border border-gray-300 px-3 py-2 text-sm w-full bg-white text-gray-900"
                  placeholder="11 2345-6789"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección *
                </label>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="border border-gray-300 px-3 py-2 text-sm w-full bg-white text-gray-900"
                  placeholder="Calle y número"
                  required
                />
              </div>
            </div>

            <div className="border border-gray-200 bg-white p-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas para el pedido <span className="text-gray-400">(opcional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="border border-gray-300 px-3 py-2 text-sm w-full bg-white text-gray-900 resize-none"
                rows={3}
                placeholder="Algún detalle adicional..."
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 text-sm border border-red-200">{error}</div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 font-semibold text-base bg-red-600 hover:bg-red-700 text-white tracking-wider disabled:opacity-50"
            >
              {submitting ? 'Enviando pedido...' : `Confirmar pedido — $${totalPrice.toFixed(2)}`}
            </button>
          </form>

          <div className="lg:col-span-2">
            <div className="border border-gray-200 bg-white p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Resumen del pedido</h3>
              <div className="space-y-3">
                {items.map((item) => {
                  const modifier = item.cutOption?.priceModifier ?? 0;
                  const unitPrice = Number(item.product.basePrice) + Number(modifier);
                  return (
                    <div key={`${item.product.id}-${item.cutOption?.id}`} className="flex justify-between text-sm">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{item.product.name}</p>
                        <p className="text-gray-500 text-xs">
                          {item.quantity} {item.product.unit}
                          {item.cutOption && ` · ${item.cutOption.name}`}
                        </p>
                      </div>
                      <span className="text-gray-900 font-medium ml-2">
                        ${(unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between font-semibold text-gray-900">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
