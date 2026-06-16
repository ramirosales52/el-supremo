import { useEffect, useState } from 'react';
import { ordersApi } from '../../api/orders';
import type { Order } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.getAll().then(setOrders).finally(() => setLoading(false));
  }, []);

  const stats = {
    pending: orders.filter((o) => o.status === 'pending').length,
    preparing: orders.filter((o) => o.status === 'preparing').length,
    ready: orders.filter((o) => o.status === 'ready').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    total: orders.length,
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Dashboard</h2>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Pendientes" count={stats.pending} />
        <StatCard label="En preparación" count={stats.preparing} />
        <StatCard label="Listos" count={stats.ready} />
        <StatCard label="Entregados" count={stats.delivered} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total de pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-3xl font-bold">{stats.total}</span>
        </CardContent>
      </Card>

      {stats.pending > 0 && (
        <Alert>
          <AlertTitle>Pedidos pendientes</AlertTitle>
          <AlertDescription>
            Tenés {stats.pending} pedido{stats.pending !== 1 ? 's' : ''} pendiente{stats.pending !== 1 ? 's' : ''} por confirmar.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

function StatCard({ label, count }: { label: string; count: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{count}</p>
      </CardContent>
    </Card>
  );
}
