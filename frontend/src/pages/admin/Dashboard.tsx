import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersApi } from '../../api/orders';
import type { Order, OrderStatus } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingBag,
  Package,
  Tags,
  Scissors,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { formatARS } from '@/lib/utils';

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pendientes',
  delivered: 'Entregados',
};

const quickLinks = [
  { to: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag, description: 'Ver y gestionar pedidos' },
  { to: '/admin/productos', label: 'Productos', icon: Package, description: 'Administrar productos' },
  { to: '/admin/categorias', label: 'Categorías', icon: Tags, description: 'Gestionar categorías' },
  { to: '/admin/cortes', label: 'Opciones de Corte', icon: Scissors, description: 'Configurar cortes' },
];

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    ordersApi.getAll().then(setOrders).finally(() => setLoading(false));
  }, []);

  const stats = {
    pending: orders.filter((o) => o.status === 'pending').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    total: orders.length,
  };

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
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
        <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="py-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Dashboard</h2>
        <Button onClick={() => navigate('/admin/pedidos')}>
          <ShoppingBag className="mr-2 h-4 w-4" />
          Ver pedidos
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
        {(Object.keys(statusLabels) as OrderStatus[]).map((status) => (
          <StatCard
            key={status}
            label={statusLabels[status]}
            count={stats[status]}
            onClick={() => navigate('/admin/pedidos')}
          />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total de pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{stats.total}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ingresos estimados</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">
              {formatARS(orders.reduce((sum, o) => sum + Number(o.total || 0), 0))}
            </span>
          </CardContent>
        </Card>
      </div>

      {stats.pending > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Pedidos pendientes</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              Tenés {stats.pending} pedido{stats.pending !== 1 ? 's' : ''} pendiente{stats.pending !== 1 ? 's' : ''} por confirmar.
            </span>
            <Button size="sm" variant="outline" onClick={() => navigate('/admin/pedidos')}>
              Ver pendientes
              <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {quickLinks.map((link) => (
          <Card
            key={link.to}
            className="cursor-pointer transition-colors hover:bg-accent"
            onClick={() => navigate(link.to)}
          >
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <link.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{link.label}</p>
                <p className="text-xs text-muted-foreground">{link.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>

      {recentOrders.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Últimos pedidos</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/pedidos')}>
              Ver todos
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent"
                onClick={() => navigate(`/admin/pedidos/${order.id}`)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">#{order.id}</span>
                  <span className="text-sm text-muted-foreground">{order.customerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {statusLabels[order.status]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString('es-AR')}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({ label, count, onClick }: { label: string; count: number; onClick?: () => void }) {
  return (
    <Card
      className={onClick ? 'cursor-pointer transition-colors hover:bg-accent' : ''}
      onClick={onClick}
    >
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
