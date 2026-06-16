import { useState } from 'react';
import { ordersApi } from '../../api/orders';
import { useOrdersPolling } from '../../hooks/useOrdersPolling';
import type { Order, OrderStatus } from '../../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  preparing: 'En preparación',
  ready: 'Listo',
  delivered: 'Entregado',
};

const statusVariant: Record<OrderStatus, 'default' | 'secondary' | 'outline' | 'destructive' | 'ghost' | 'link'> = {
  pending: 'default',
  preparing: 'secondary',
  ready: 'outline',
  delivered: 'ghost',
};

const nextStatus: Record<OrderStatus, OrderStatus> = {
  pending: 'preparing',
  preparing: 'ready',
  ready: 'delivered',
  delivered: 'delivered',
};

const statusOrder: OrderStatus[] = ['pending', 'preparing', 'ready', 'delivered'];

export default function OrdersAdmin() {
  const { orders, filterByStatus, refresh } = useOrdersPolling();
  const [filter, setFilter] = useState<OrderStatus | undefined>(undefined);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

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
        <h2 className="text-xl font-bold">Pedidos</h2>
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

      <div className="space-y-4">
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
                      onClick={() =>
                        setSelectedOrder(
                          selectedOrder?.id === order.id ? null : order
                        )
                      }
                    >
                      {selectedOrder?.id === order.id ? 'Ocultar' : 'Detalle'}
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
              </CardContent>

              {selectedOrder?.id === order.id && (
                <>
                  <Separator />
                  <CardContent>
                    <p className="mb-2 text-sm font-medium">Productos:</p>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between rounded-lg bg-muted/50 p-2 text-sm"
                        >
                          <div>
                            <span className="font-medium">{item.product.name}</span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              {item.quantity} {item.unit}
                            </span>
                            {item.cutOption && (
                              <span className="ml-2 text-xs text-primary">
                                · {item.cutOption.name}
                              </span>
                            )}
                            {item.notes && (
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                Nota: {item.notes}
                              </p>
                            )}
                          </div>
                          <span className="font-medium">
                            $
                            {(
                              item.unitPrice * Number(item.quantity)
                            ).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex justify-between border-t pt-3 font-semibold">
                      <span>Total</span>
                      <span>
                        $
                        {order.items
                          .reduce(
                            (sum, i) => sum + i.unitPrice * Number(i.quantity),
                            0
                          )
                          .toFixed(2)}
                      </span>
                    </div>
                    {order.notes && (
                      <div className="mt-3 text-sm text-muted-foreground">
                        <span className="font-medium">Notas del pedido:</span>{' '}
                        {order.notes}
                      </div>
                    )}
                  </CardContent>
                </>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
