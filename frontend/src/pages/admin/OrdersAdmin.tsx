import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersApi } from '../../api/orders';
import { useOrdersPolling } from '../../hooks/useOrdersPolling';
import type { Order, OrderStatus } from '../../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

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

const statusOrder: OrderStatus[] = ['pending', 'delivered'];

export default function OrdersAdmin() {
  const { orders, filterByStatus, refresh } = useOrdersPolling();
  const [filter, setFilter] = useState<OrderStatus | undefined>(undefined);
  const [updating, setUpdating] = useState<number | null>(null);
  const navigate = useNavigate();

  const filteredOrders = filterByStatus(filter);

  const handleAdvanceStatus = async (order: Order) => {
    const next = nextStatus[order.status];
    if (next === order.status) return;
    setUpdating(order.id);
    try {
      await ordersApi.updateStatus(order.id, next);
      refresh();
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Pedidos</h2>
        <div className="flex gap-2">
          {statusOrder.map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(filter === status ? undefined : status)}
            >
              {statusLabels[status]}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-muted-foreground">
              <span className="mb-3 block text-4xl">📋</span>
              <p className="text-sm">
                No hay pedidos {filter ? statusLabels[filter].toLowerCase() : ''}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle>Pedido #{order.id}</CardTitle>
                      <Badge variant={statusVariant[order.status]}>
                        {statusLabels[order.status]}
                      </Badge>
                    </div>
                    <CardDescription>
                      {new Date(order.createdAt).toLocaleString('es-AR')}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/pedidos/${order.id}`)}
                    >
                      Detalle
                    </Button>
                    {order.status !== 'delivered' && (
                      <Button
                        size="sm"
                        onClick={() => handleAdvanceStatus(order)}
                        disabled={updating === order.id}
                      >
                        {updating === order.id
                          ? '...'
                          : `→ ${statusLabels[nextStatus[order.status]]}`}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  👤 {order.customerName} · 📞 {order.customerPhone}
                  {order.customerAddress && <> · 📍 {order.customerAddress}</>}
                </p>
                <p className="text-xs text-muted-foreground/70">
                  {order.items.length} producto{order.items.length !== 1 ? 's' : ''} · Total: ${order.total.toFixed(2)}
                </p>
                {order.paymentMethod && (
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px]">
                      {paymentLabels[order.paymentMethod]}
                    </Badge>
                    {order.discount > 0 && (
                      <Badge variant="secondary" className="text-[10px]">
                        -${order.discount.toFixed(2)} desc.
                      </Badge>
                    )}
                    {order.shippingCost > 0 ? (
                      <Badge variant="ghost" className="text-[10px]">
                        Envío ${order.shippingCost.toFixed(2)}
                      </Badge>
                    ) : (
                      <Badge variant="ghost" className="text-[10px] text-green-600">
                        Envío gratis
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
