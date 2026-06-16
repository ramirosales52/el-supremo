import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Cart from './pages/Cart';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import OrdersAdmin from './pages/admin/OrdersAdmin';
import ProductsAdmin from './pages/admin/ProductsAdmin';
import CategoriesAdmin from './pages/admin/CategoriesAdmin';
import CutOptionsAdmin from './pages/admin/CutOptionsAdmin';

function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname, search]);
  return null;
}

export default function App() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Routes>
        <Route
          path="/*"
          element={
            <>
              <ScrollToTop />
              <Navbar />
              <div className="flex-1 flex flex-col">
                <Routes>
                  <Route index element={<Home />} />
                  <Route path="productos" element={<Products />} />
                  <Route path="producto/:id" element={<ProductDetail />} />
                  <Route path="carrito" element={<Cart />} />
                  <Route path="checkout" element={<Checkout />} />
                  <Route path="admin" element={<AdminLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="pedidos" element={<OrdersAdmin />} />
                    <Route path="productos" element={<ProductsAdmin />} />
                    <Route path="categorias" element={<CategoriesAdmin />} />
                    <Route path="cortes" element={<CutOptionsAdmin />} />
                  </Route>
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
              <Footer />
            </>
          }
        />
      </Routes>
    </div>
  );
}
