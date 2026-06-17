import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersApi } from '../../api/orders';
import type { Order, OrderStatus } from '../../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft } from 'lucide-react';
import { getProductImageUrl } from '@/api/storage';

function effectivePrice(item: Order['items'][0]) {
  return item.unitPrice || Number(item.product.basePrice) + Number(item.cutOption?.priceModifier ?? 0);
}

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

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

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
        <Badge variant={statusVariant[order.status]} className="ml-auto">
          {statusLabels[order.status]}
        </Badge>
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
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
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
                  {item.product.image ? (
                    <img
                      src={getProductImageUrl(item.product.image)}
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

          <div className="flex justify-between text-lg font-bold text-gray-900">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {order.status !== 'delivered' && (
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate('/admin/pedidos')}>
            Volver
          </Button>
          <Button onClick={handleAdvanceStatus} disabled={updating}>
            {updating
              ? '...'
              : `Avanzar a ${statusLabels[nextStatus[order.status]]}`}
          </Button>
        </div>
      )}
    </div>
  );
}
