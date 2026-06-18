import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { categoriesApi } from '../api/categories';
import type { Category } from '../types';
import logo from '../assets/logo-blanco.png';

export default function Navbar() {
  const { totalItems, subtotal } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    categoriesApi.getAll().then(setCategories);
  }, []);

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  const params = new URLSearchParams(location.search);
  const activeCategoryId = params.get('categoryId');
  const currentSearch = params.get('search') || '';

  const handleSearchToggle = () => {
    const opening = !searchOpen;
    setSearchOpen(opening);
    if (opening) {
      setSearchValue(currentSearch);
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setSearchValue('');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchValue.trim();
    if (q) {
      navigate(`/productos?search=${encodeURIComponent(q)}`);
      setSearchOpen(false);
      setSearchValue('');
    }
  };

  const handleClearSearch = () => {
    setSearchValue('');
    inputRef.current?.focus();
    if (location.pathname === '/productos' && currentSearch) {
      const newParams = new URLSearchParams(location.search);
      newParams.delete('search');
      const qs = newParams.toString();
      navigate(qs ? `/productos?${qs}` : '/productos');
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearchOpen(false);
      setSearchValue('');
    }
  };

  const isActive = (path: string, catId?: number) => {
    if (catId) return location.pathname === '/productos' && activeCategoryId === String(catId);
    return location.pathname === path;
  };

  const navLink = (to: string, label: string, catId?: number) => (
    <Link
      to={to}
      className={`relative uppercase tracking-widest text-sm font-medium px-1 py-1 transition-all duration-200 hover:scale-105 inline-block
        ${isActive(to, catId)
          ? 'text-white border-b-2 border-primary-500'
          : 'text-white/70 hover:text-white'
        }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="bg-black sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img src={logo} alt="El Supremo" className="h-8 w-auto" />
          </Link>

          <div className="hidden md:flex items-center gap-0 text-white uppercase text-sm font-medium">
            {categories.map((cat, i) => (
              <span key={cat.id} className="flex items-center gap-0">
                {i > 0 && <span className="text-gray-600 mx-2 select-none">|</span>}
                {navLink(`/productos?categoryId=${cat.id}`, cat.name, cat.id)}
              </span>
            ))}
          </div>

          <div className="flex items-center ml-6">
            <button
              onClick={handleSearchToggle}
              className="p-2 text-gray-300 hover:text-primary-500 transition-colors mr-1 cursor-pointer"
              aria-label="Buscar productos"
            >
              <div className="w-9 h-9 rounded-full border-2 border-gray-600 flex items-center justify-center hover:border-primary-500 transition-colors cursor-pointer">
                <Search className="w-4 h-4 stroke-[2.5]" />
              </div>
            </button>
            <Link
              to="/carrito"
              className="relative flex items-center gap-3 p-2 pr-3 text-gray-300 hover:text-primary-500 transition-colors"
            >
              <div className="relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
                  />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </div>
              <span className="text-base font-bold text-primary-400 tabular-nums">
                ${subtotal.toFixed(2)}
              </span>
            </Link>
          </div>
        </div>
      </div>
      {searchOpen && (
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                ref={inputRef}
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Buscar productos..."
                className="w-full bg-neutral-800 text-white border border-gray-700 pl-10 pr-10 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors cursor-pointer"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </nav>
  );
}
