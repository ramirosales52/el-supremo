import { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Cart from './pages/Cart';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import OrdersAdmin from './pages/admin/OrdersAdmin';
import OrderDetail from './pages/admin/OrderDetail';
import ProductsAdmin from './pages/admin/ProductsAdmin';
import CategoriesAdmin from './pages/admin/CategoriesAdmin';
import CutOptionsAdmin from './pages/admin/CutOptionsAdmin';

function PublicLayout() {
  const { pathname, search } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname, search]);
  return (
    <>
      <Navbar />
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>
      <Footer />
    </>
  );
}

function ProtectedAdmin({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="productos" element={<Products />} />
          <Route path="producto/:id" element={<ProductDetail />} />
          <Route path="carrito" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
        <Route path="admin/login" element={<AdminLogin />} />
        <Route
          path="admin"
          element={
            <ProtectedAdmin>
              <AdminLayout />
            </ProtectedAdmin>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="pedidos" element={<OrdersAdmin />} />
          <Route path="pedidos/:id" element={<OrderDetail />} />
          <Route path="productos" element={<ProductsAdmin />} />
          <Route path="categorias" element={<CategoriesAdmin />} />
          <Route path="cortes" element={<CutOptionsAdmin />} />
        </Route>
      </Routes>
    </div>
  );
}
