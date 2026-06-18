import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Tags,
  Scissors,
  Menu,
  Store,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import logo from '@/assets/logo-blanco.png';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { to: '/admin/productos', label: 'Productos', icon: Package },
  { to: '/admin/categorias', label: 'Categorías', icon: Tags },
  { to: '/admin/cortes', label: 'Opciones de Corte', icon: Scissors },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { logout } = useAuth();

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-20 items-center justify-center border-b px-5">
        <img src={logo} alt="El Supremo" className="h-10 w-auto" />
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t p-3 space-y-1">
        <NavLink
          to="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <Store className="h-4 w-4" />
          Volver a la tienda
        </NavLink>
        <button
          onClick={() => { logout(); onNavigate?.(); }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile header */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-3 border-b bg-white px-4 md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon-sm" className="text-gray-500">
                <Menu className="h-5 w-5" />
              </Button>
            }
          />
        </Sheet>
        <img src={logo} alt="El Supremo" className="h-8 w-auto" />
      </div>

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 border-r bg-white md:block">
        <SidebarContent />
      </aside>

      {/* Content area */}
      <main className="flex-1 overflow-auto pt-14 md:pt-0">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
