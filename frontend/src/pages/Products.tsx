import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsApi } from '../api/products';
import { categoriesApi } from '../api/categories';
import type { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryIdParam = searchParams.get('categoryId');
  const selectedCategory = categoryIdParam ? Number(categoryIdParam) : null;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoriesApi.getAll().then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    productsApi.getAll(selectedCategory ?? undefined)
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  const handleCategoryChange = (catId: number | null) => {
    if (catId === null) {
      setSearchParams({});
    } else {
      setSearchParams({ categoryId: String(catId) });
    }
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

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
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
            <p className="text-lg">No hay productos en esta categoría</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
