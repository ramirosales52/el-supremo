import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsApi } from '../api/products';
import { categoriesApi } from '../api/categories';
import type { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';

const PAGE_SIZE = 16;

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryIdParam = searchParams.get('categoryId');
  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = categoryIdParam ? Number(categoryIdParam) : null;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const hasMoreRef = useRef(true);
  const loadingMoreRef = useRef(false);
  const readyRef = useRef(false);
  const pageRef = useRef(1);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const fetchProductsRef = useRef<((page: number, append: boolean) => Promise<void>) | null>(null);

  const fetchProducts = useCallback(async (page: number, append: boolean) => {
    if (append) {
      loadingMoreRef.current = true;
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    const result = await productsApi.getAll(
      selectedCategory ?? undefined,
      searchQuery || undefined,
      page,
      PAGE_SIZE
    );

    setProducts((prev) => (append ? [...prev, ...result.products] : result.products));
    hasMoreRef.current = page * PAGE_SIZE < result.count;

    if (append) {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    } else {
      readyRef.current = true;
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  fetchProductsRef.current = fetchProducts;

  useEffect(() => {
    categoriesApi.getAll().then(setCategories);
  }, []);

  useEffect(() => {
    pageRef.current = 1;
    hasMoreRef.current = true;
    loadingMoreRef.current = false;
    readyRef.current = false;
    fetchProducts(1, false);
  }, [fetchProducts]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && readyRef.current && !loadingMoreRef.current && hasMoreRef.current) {
          loadingMoreRef.current = true;
          pageRef.current += 1;
          fetchProductsRef.current?.(pageRef.current, true);
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const handleCategoryChange = (catId: number | null) => {
    const params: Record<string, string> = {};
    if (catId !== null) params.categoryId = String(catId);
    if (searchQuery) params.search = searchQuery;
    setSearchParams(params);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          <button
            onClick={() => handleCategoryChange(null)}
            className={`cursor-pointer px-5 py-2 text-sm font-medium transition-all ${
              selectedCategory === null
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 border border-gray-300 hover:border-gray-900 hover:text-gray-900'
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`cursor-pointer px-5 py-2 text-sm font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 border border-gray-300 hover:border-gray-900 hover:text-gray-900'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {searchQuery && (
          <p className="text-center text-lg text-gray-500 mb-8">
            Resultados para: <span className="font-semibold text-gray-900">"{searchQuery}"</span>
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="border border-gray-200 bg-white h-72 animate-pulse">
                <div className="h-40 bg-gray-100 border-b border-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-100 w-3/4" />
                  <div className="h-3 bg-gray-100 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <span className="text-5xl block mb-4">🔍</span>
            <p className="text-lg">{searchQuery ? `Sin resultados para "${searchQuery}"` : 'No hay productos en esta categoría'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div ref={sentinelRef} className="py-8">
          {loadingMore && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border border-gray-200 bg-white h-72 animate-pulse">
                  <div className="h-40 bg-gray-100 border-b border-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-100 w-3/4" />
                    <div className="h-3 bg-gray-100 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
