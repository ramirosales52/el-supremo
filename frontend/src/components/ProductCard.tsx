import { useNavigate } from 'react-router-dom';
import type { Product } from '../types';
import { getProductImageUrl } from '../api/storage';
import { getSalePrice, formatARS } from '../lib/utils';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();

  const unavailable = !product.isAvailable;

  return (
    <div className={`border border-gray-200 bg-white flex flex-col group ${unavailable ? 'opacity-60' : ''}`}>
      <div className="h-44 bg-gray-50 flex items-center justify-center relative overflow-hidden border-b border-gray-200">
        {product.images?.[0] ? (
          <img
            src={getProductImageUrl(product.images[0])}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <span className="text-6xl opacity-20 relative group-hover:scale-110 transition-transform duration-300">🥩</span>
        )}
        {product.isOnSale && product.discountPercentage && (
          <span className="absolute top-2 left-2 rounded bg-red-600 px-2 py-1 text-xs font-bold text-white shadow-md">
            -{product.discountPercentage}%
          </span>
        )}
        {unavailable && (
          <span className="absolute top-2 right-2 rounded bg-gray-700 px-2 py-1 text-xs font-bold text-white shadow-md">
            NO DISPONIBLE
          </span>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col gap-2">
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 self-start">
          {product.category.name}
        </span>

        <h3 className="font-semibold text-gray-900 text-lg leading-tight">{product.name}</h3>

        <div className="flex items-baseline gap-1 mt-auto">
          {(() => {
            const salePrice = getSalePrice(product);
            if (salePrice !== null) {
              return (
                <>
                  <span className="text-sm text-gray-400 line-through">{formatARS(Number(product.basePrice))}</span>
                  <span className="text-xl font-bold text-red-600">{formatARS(salePrice)}</span>
                </>
              );
            }
            return <span className="text-xl font-bold text-gray-900">{formatARS(Number(product.basePrice))}</span>;
          })()}
          <span className="text-sm text-gray-400">/ {product.unit}</span>
        </div>

        <button
          onClick={() => navigate(`/producto/${product.id}`)}
          disabled={unavailable}
          className={`mt-3 w-full py-2.5 font-semibold text-sm tracking-wider transition-all ${
            unavailable
              ? 'cursor-not-allowed bg-gray-400 text-white'
              : 'cursor-pointer bg-red-600 hover:bg-red-700 text-white active:scale-[0.98]'
          }`}
        >
          {unavailable ? 'NO DISPONIBLE' : 'SELECCIONAR OPCIONES'}
        </button>
      </div>
    </div>
  );
}
