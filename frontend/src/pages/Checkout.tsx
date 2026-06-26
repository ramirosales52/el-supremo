import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ordersApi } from '../api/orders';
import type { PaymentMethod, DeliveryTimeSlot } from '../types';
import {
  SHIPPING_COST, FREE_SHIPPING_THRESHOLD, TRANSFER_DISCOUNT_RATE, getEffectivePrice,
  CUTOFF_HOUR, DELIVERY_SLOTS, getAvailableDeliveryDates, getAvailableSlots, formatDeliveryDate, toDateInputValue
} from '../lib/utils';

const paymentMethods: { value: PaymentMethod; label: string; description: string }[] = [
  { value: 'cash', label: 'Efectivo', description: 'Pagás en efectivo al recibir el pedido' },
  { value: 'transfer', label: 'Transferencia bancaria', description: '5% de descuento por transferencia' },
  { value: 'card', label: 'Tarjeta de crédito/débito', description: 'Pagás con tarjeta al recibir el pedido' },
];

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  const availableDates = useMemo(() => getAvailableDeliveryDates(), []);
  const defaultDate = useMemo(() => toDateInputValue(availableDates[0]), [availableDates]);
  const [deliveryDate, setDeliveryDate] = useState(defaultDate);
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState<DeliveryTimeSlot>('afternoon');

  const selectedDateObj = useMemo(
    () => availableDates.find(d => toDateInputValue(d) === deliveryDate),
    [deliveryDate, availableDates]
  );

  const availableSlots = useMemo(() => {
    if (!selectedDateObj) return DELIVERY_SLOTS;
    const validSlots = getAvailableSlots(selectedDateObj);
    return DELIVERY_SLOTS.filter(s => validSlots.includes(s.value));
  }, [selectedDateObj]);

  useEffect(() => {
    if (availableSlots.length > 0 && !availableSlots.some(s => s.value === deliveryTimeSlot)) {
      setDeliveryTimeSlot(availableSlots[0].value);
    }
  }, [availableSlots, deliveryTimeSlot]);

  const discount = useMemo(() => {
    if (paymentMethod === 'transfer') return subtotal * TRANSFER_DISCOUNT_RATE;
    return 0;
  }, [paymentMethod, subtotal]);

  const discountedSubtotal = subtotal - discount;

  const shippingCost = useMemo(() => {
    if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
    return SHIPPING_COST;
  }, [subtotal]);

  const total = discountedSubtotal + shippingCost;

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
          <p className="text-gray-500 mb-2">
            Recibimos tu pedido. Te vamos a contactar para confirmar.
          </p>
          {selectedDateObj && (
            <p className="text-gray-700 font-medium mb-6">
              📅 {formatDeliveryDate(selectedDateObj)} — {DELIVERY_SLOTS.find(s => s.value === deliveryTimeSlot)?.label}
            </p>
          )}
          <button onClick={() => navigate('/')} className="cursor-pointer px-6 py-2.5 font-semibold text-sm bg-red-600 hover:bg-red-700 text-white tracking-wider">
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
        paymentMethod,
        subtotal,
        discount,
        shippingCost,
        total,
        idempotencyKey,
        deliveryDate: deliveryDate || undefined,
        deliveryTimeSlot,
        notes: notes.trim() || undefined,
        items: items.map((item) => {
          const unitPrice = getEffectivePrice(item.product, item.cutOption?.priceModifier ?? 0);
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

            <div className="border border-gray-200 bg-amber-50 p-5 space-y-2">
              <h3 className="font-semibold text-amber-800 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Horarios de entrega
              </h3>
              <p className="text-sm text-amber-700">
                Pedidos confirmados antes de las {CUTOFF_HOUR}:00 hs se entregan el mismo día por la tarde.
                Después de las {CUTOFF_HOUR}:00 hs, la entrega es al día siguiente.
              </p>
            </div>

            <div className="border border-gray-200 bg-white p-5 space-y-4">
              <h3 className="font-semibold text-gray-900">Elegí tu fecha de entrega</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableDates.map((date) => {
                  const value = toDateInputValue(date);
                  const isSelected = deliveryDate === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setDeliveryDate(value)}
                      className={`text-left px-3 py-2.5 text-sm border transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-red-600 bg-red-50 text-red-900 font-medium'
                          : 'border-gray-200 hover:border-gray-400 text-gray-700'
                      }`}
                    >
                      <span className="block text-xs text-gray-400">
                        {date.toLocaleDateString('es-AR', { month: 'short' }).replace('.', '')}
                      </span>
                      <span className="block">
                        {date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric' })}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border border-gray-200 bg-white p-5 space-y-3">
              <h3 className="font-semibold text-gray-900">Elegí tu franja horaria</h3>
              <div className="grid grid-cols-2 gap-3">
                {availableSlots.map((slot) => (
                  <label
                    key={slot.value}
                    className={`flex items-center gap-3 p-3 border cursor-pointer transition-colors ${
                      deliveryTimeSlot === slot.value
                        ? 'border-red-600 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryTimeSlot"
                      value={slot.value}
                      checked={deliveryTimeSlot === slot.value}
                      onChange={() => setDeliveryTimeSlot(slot.value)}
                      className="accent-red-600"
                    />
                    <span className="text-sm text-gray-900">{slot.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border border-gray-200 bg-white p-5 space-y-3">
              <h3 className="font-semibold text-gray-900">Medio de pago</h3>
              {paymentMethods.map((pm) => (
                <label
                  key={pm.value}
                  className={`flex items-center gap-3 p-3 border cursor-pointer transition-colors ${paymentMethod === pm.value
                      ? 'border-red-600 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={pm.value}
                    checked={paymentMethod === pm.value}
                    onChange={() => setPaymentMethod(pm.value)}
                    className="accent-red-600"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{pm.label}</p>
                    <p className="text-xs text-gray-500">{pm.description}</p>
                  </div>
                </label>
              ))}
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
              className="cursor-pointer w-full py-3 font-semibold text-base bg-red-600 hover:bg-red-700 text-white tracking-wider disabled:opacity-50"
            >
              {submitting ? 'Enviando pedido...' : `Confirmar pedido — $${total.toFixed(2)}`}
            </button>
          </form>

          <div className="lg:col-span-2">
            <div className="border border-gray-200 bg-white p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Resumen del pedido</h3>
              <div className="space-y-3">
                {items.map((item) => {
                  const unitPrice = getEffectivePrice(item.product, item.cutOption?.priceModifier ?? 0);
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
              <div className="border-t border-gray-200 mt-4 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuento transferencia (5%)</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>Envío</span>
                  <span>{shippingCost === 0 ? <span className="text-green-600 font-medium">Gratis</span> : `$${shippingCost.toFixed(2)}`}</span>
                </div>
                {subtotal >= FREE_SHIPPING_THRESHOLD && (
                  <p className="text-xs text-green-600">Envío gratis por pedido mayor a ${FREE_SHIPPING_THRESHOLD.toFixed(2)}</p>
                )}
              </div>
              <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
