import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersApi } from '../../api/orders';
import type { Order, OrderStatus } from '../../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, MessageCircle } from 'lucide-react';
import { getProductImageUrl } from '@/api/storage';

function getWhatsAppUrl(order: Order): string {
  const cleanPhone = order.customerPhone.replace(/\D/g, '');
  const productList = order.items
    .map(
      (item) =>
        `- ${item.quantity} ${item.unit} ${item.product.name}${item.cutOption ? ` (${item.cutOption.name})` : ''}`,
    )
    .join('\n');
  let deliveryText = '';
  if (order.deliveryDate) {
    const d = new Date(order.deliveryDate + 'T12:00:00');
    const dateStr = d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
    const slotLabel = order.deliveryTimeSlot === 'morning' ? 'Mañana' : 'Tarde';
    deliveryText = `\n\n📅 Entrega: ${dateStr} - ${slotLabel}`;
  }
  const message = encodeURIComponent(
    `¡Hola! Recibimos tu pedido.${deliveryText}\n\nProductos:\n${productList}\n\nEstamos preparándolo y te avisaremos cuando esté listo. ¡Gracias por tu compra!`
  );
  return `https://wa.me/${cleanPhone}?text=${message}`;
}

function effectivePrice(item: Order['items'][0]) {
  return item.unitPrice || Number(item.product.basePrice) + Number(item.cutOption?.priceModifier ?? 0);
}

const paymentLabels: Record<string, string> = {
  cash: 'Efectivo',
  transfer: 'Transferencia',
  card: 'Tarjeta',
};

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  delivered: 'Entregado',
};

const statusVariant: Record<OrderStatus, 'default' | 'secondary' | 'outline' | 'destructive' | 'ghost' | 'link'> = {
  pending: 'default',
  delivered: 'ghost',
};

const nextStatus: Record<OrderStatus, OrderStatus> = {
  pending: 'delivered',
  delivered: 'delivered',
};

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    ordersApi.getById(Number(id)).then(setOrder).finally(() => setLoading(false));
  }, [id]);

  const handleAdvanceStatus = async () => {
    if (!order) return;
    const next = nextStatus[order.status];
    if (next === order.status) return;
    setUpdating(true);
    try {
      await ordersApi.updateStatus(order.id, next);
      setOrder(await ordersApi.getById(order.id));
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!order) return;
    if (!confirm('¿Eliminar este pedido?')) return;
    setDeleting(true);
    try {
      await ordersApi.delete(order.id);
      navigate('/admin/pedidos');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        <p className="text-lg">Pedido no encontrado</p>
        <Button variant="link" onClick={() => navigate('/admin/pedidos')}>
          Volver a pedidos
        </Button>
      </div>
    );
  }

  const total = order.items.reduce(
    (sum, i) => sum + effectivePrice(i) * Number(i.quantity),
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => navigate('/admin/pedidos')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Pedido #{order.id}</h2>
          <p className="text-sm text-muted-foreground">
            {new Date(order.createdAt).toLocaleString('es-AR')}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <a
            href={getWhatsAppUrl(order)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              size="sm"
              className="text-green-600 border-green-300 hover:bg-green-50"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              WhatsApp
          </Button>
        </a>
          <Badge variant={statusVariant[order.status]}>
            {statusLabels[order.status]}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nombre</span>
              <span className="font-medium">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Teléfono</span>
              <span className="font-medium">{order.customerPhone}</span>
            </div>
            {order.customerAddress && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dirección</span>
                <span className="text-right font-medium">{order.customerAddress}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {order.deliveryDate && (
          <Card>
            <CardHeader>
              <CardTitle>Entrega</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha</span>
                <span className="font-medium">
                  {new Date(order.deliveryDate + 'T12:00:00').toLocaleDateString('es-AR', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Franja</span>
                <span className="font-medium">
                  {order.deliveryTimeSlot === 'morning' ? 'Mañana (9:00 - 13:00)' : 'Tarde (14:00 - 19:00)'}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Productos</span>
              <span className="font-medium">{order.items.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estado</span>
              <Badge variant={statusVariant[order.status]}>
                {statusLabels[order.status]}
              </Badge>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pago</span>
              <span className="font-medium">{paymentLabels[order.paymentMethod] ?? order.paymentMethod}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Descuento</span>
                <span className="font-medium">-${Number(order.discount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Envío</span>
              <span className={order.shippingCost > 0 ? 'font-medium' : 'font-medium text-green-600'}>
                {order.shippingCost > 0 ? `$${Number(order.shippingCost).toFixed(2)}` : 'Gratis'}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>${Number(order.total).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {order.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notas del pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{order.notes}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-lg bg-muted/50 p-3"
              >
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                  {item.product.images?.[0] ? (
                    <img
                      src={getProductImageUrl(item.product.images[0])}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl">
                      🥩
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{item.product.name}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    <span>
                      {item.quantity} {item.unit}
                    </span>
                    {item.cutOption && (
                      <span>· {item.cutOption.name}</span>
                    )}
                    <span>
                      · ${effectivePrice(item).toFixed(2)}/{item.unit}
                    </span>
                  </div>
                  {item.notes && (
                    <p className="mt-0.5 text-xs text-muted-foreground/60">Nota: {item.notes}</p>
                  )}
                </div>
                <span className="shrink-0 font-medium text-gray-900">
                  ${(effectivePrice(item) * Number(item.quantity)).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          {order.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600 mb-2">
              <span>Descuento ({order.paymentMethod === 'transfer' ? '5% transferencia' : ''})</span>
              <span>-${Number(order.discount).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>Envío</span>
            <span>{order.shippingCost > 0 ? `$${Number(order.shippingCost).toFixed(2)}` : <span className="text-green-600">Gratis</span>}</span>
          </div>

          <Separator className="my-3" />

          <div className="flex justify-between text-lg font-bold text-gray-900">
            <span>Total</span>
            <span>${Number(order.total).toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate('/admin/pedidos')}>
          Volver
        </Button>
        <Button
          variant="link"
          className="text-destructive"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? '...' : 'Eliminar pedido'}
        </Button>
        {order.status !== 'delivered' && (
          <Button onClick={handleAdvanceStatus} disabled={updating}>
            {updating
              ? '...'
              : `Avanzar a ${statusLabels[nextStatus[order.status]]}`}
          </Button>
        )}
      </div>
    </div>
  );
}
