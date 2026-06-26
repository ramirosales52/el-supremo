import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsApi } from '../api/products';
import type { Product } from '../types';
import { getProductImageUrl } from '../api/storage';
import { getSalePrice, formatARS } from '../lib/utils';

export default function SaleProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsApi.getOnSale()
      .then(res => setProducts(res))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="bg-zinc-50 max-w-full px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="mx-auto h-4 w-24 animate-pulse bg-zinc-200" />
            <div className="mx-auto mt-4 h-10 w-96 animate-pulse bg-zinc-200" />
            <div className="mx-auto mt-3 h-5 w-64 animate-pulse bg-zinc-200" />
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-80 animate-pulse bg-zinc-200" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="bg-zinc-50 max-w-full px-4 sm:px-6 lg:px-8 py-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-sm font-semibold uppercase tracking-[0.15em] text-red-500">
            OFERTAS
          </span>
          <h2
            className="mt-4 text-4xl uppercase tracking-[0.05em] text-zinc-900 md:text-5xl"
            style={{ fontFamily: '"Anton", sans-serif', fontWeight: 400 }}
          >
            APROVECHÁ LOS DESCUENTOS
          </h2>
          <p className="mt-3 text-lg text-zinc-500">
            Productos seleccionados con precios especiales
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 8).map((product, i) => (
            <SaleCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SaleCard({ product, index }: { product: Product; index: number }) {
  const navigate = useNavigate();
  const salePrice = getSalePrice(product);
  const imageUrl = product.images?.[0] ? getProductImageUrl(product.images[0]) : null;

  return (
    <div
      className="group cursor-pointer border border-zinc-200 bg-white transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
      style={{ animation: `saleCardFadeIn 0.6s ${index * 0.1}s both` }}
      onClick={() => navigate(`/producto/${product.id}`)}
    >
      <div className="relative h-48 bg-zinc-100">
        <div className="absolute inset-0 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-5xl opacity-20">🥩</span>
            </div>
          )}
        </div>

        {product.discountPercentage && (
          <div className="absolute -right-3 -top-3 h-20 w-20">
            <div className="flex h-full w-full rotate-12 items-center justify-center rounded-full bg-red-600 shadow-lg transition-transform duration-300 group-hover:rotate-0">
              <span className="-ml-1 text-lg font-bold leading-none text-white">
                -{product.discountPercentage}%
              </span>
            </div>
          </div>
        )}

        <div className="absolute bottom-2 left-2 bg-red-600/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white">
          Oferta
        </div>
      </div>

      <div className="p-4">
        <span className="bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500">
          {product.category.name}
        </span>

        <h3 className="mt-2 line-clamp-2 text-base font-semibold leading-tight text-zinc-900">
          {product.name}
        </h3>

        <div className="mt-3 flex flex-wrap items-baseline gap-2">
          <span className="text-sm text-zinc-400 line-through">
            {formatARS(Number(product.basePrice))}
          </span>
          {salePrice !== null && (
            <span className="text-2xl font-bold text-red-600">
              {formatARS(salePrice)}
            </span>
          )}
          <span className="text-sm text-zinc-400">/ {product.unit}</span>
        </div>

        <button
          onClick={e => {
            e.stopPropagation();
            navigate(`/producto/${product.id}`);
          }}
          className="mt-4 w-full cursor-pointer bg-red-600 py-2.5 text-sm font-semibold tracking-wider text-white transition-all hover:bg-red-700 active:scale-[0.98]"
        >
          APROVECHAR OFERTA
        </button>
      </div>
    </div>
  );
}
