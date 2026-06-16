import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ChevronLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const tabs = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/pedidos', label: 'Pedidos' },
  { to: '/admin/productos', label: 'Productos' },
  { to: '/admin/categorias', label: 'Categorías' },
  { to: '/admin/cortes', label: 'Opciones de Corte' },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <NavLink to="/">
              <Button variant="ghost" size="icon-sm">
                <ChevronLeftIcon />
              </Button>
            </NavLink>
            <span className="font-semibold">Admin Panel</span>
          </div>
        </div>
        <Separator />
        <div className="mx-auto flex max-w-7xl gap-1 px-4 sm:px-6 lg:px-8">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                cn(
                  'inline-flex items-center border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                )
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </div>
    </div>
  );
}
