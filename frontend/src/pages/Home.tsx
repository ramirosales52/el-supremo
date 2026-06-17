import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoriesApi } from '../api/categories';
import type { Category, Product } from '../types';
import banner from '../assets/banner.png';
import { productsApi } from '../api/products';
import ProductCard from '../components/ProductCard';
import Autoplay from 'embla-carousel-autoplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../components/ui/carousel';

const gradients = [
  'from-red-600 to-red-700',
  'from-red-600 to-red-700',
  'from-red-600 to-red-700',
  'from-red-600 to-red-700',
  'from-red-600 to-red-700',
  'from-red-600 to-red-700',
];

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoriesApi.getAll()
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  useEffect(() => {
    productsApi.getAll()
      .then(products => setFeaturedProducts(products.slice(0, 8)))
      .finally(() => setFeaturedLoading(false));
  }, []);

  return (
    <div className="bg-black">
      <section className="relative h-[70vh] min-h-[500px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={banner} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black" />
        </div>
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-7xl leading-[1] text-white mb-8 uppercase tracking-[0.05em]" style={{ fontFamily: '"Anton", sans-serif', fontWeight: 400 }}>
            PEDÍ<br />
            COMO QUIERAS.<br />
            <span className="text-red-500">NOSOTROS</span><br />
            <span className="text-red-500">LO PREPARAMOS.</span>
          </h1>
          <p className="text-base md:text-lg text-gray-400 leading-relaxed mb-8 max-w-lg">
            Elegí el corte, el grosor, la cantidad y cómo lo querés recibir.<br />
            Te llega cortado, porcionado y listo para el freezer.
          </p>
          <Link
            to="/productos"
            className="btn-primary text-base px-8 py-3 inline-flex items-center gap-2 uppercase"
          >
            Empezar pedido
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl text-white uppercase tracking-[0.05em]" style={{ fontFamily: '"Anton", sans-serif', fontWeight: 400 }}>NUESTRAS CATEGORÍAS</h2>
          <p className="text-gray-400 mt-3 text-lg">Explorá nuestros productos por categoría</p>
        </div>

        {loading ? (
          <div className="flex flex-wrap justify-center gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-36 h-36 bg-surface-light animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="text-center text-gray-500">No hay categorías disponibles</p>
        ) : (
          <div className="flex flex-wrap justify-center gap-10">
            {categories.map((cat, i) => (
              <Link
                key={cat.id}
                to={`/productos?categoryId=${cat.id}`}
                className="group flex flex-col items-center gap-4"
              >
                <div
                  className={`w-40 h-40 bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-primary-600/30`}
                >
                  <span className="text-lg font-bold text-white uppercase tracking-wide text-center leading-tight px-2" style={{ fontFamily: '"Roboto", sans-serif' }}>{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white max-w-full px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl text-zinc-900 uppercase tracking-[0.05em]" style={{ fontFamily: '"Anton", sans-serif', fontWeight: 400 }}>
              PRODUCTOS DESTACADOS
            </h2>
            <p className="text-zinc-500 mt-3 text-lg">Los más elegidos por nuestros clientes</p>
          </div>

          {featuredLoading ? (
            <div className="flex justify-center gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-full max-w-[280px] h-80 bg-zinc-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[
                Autoplay({
                  delay: 4000,
                  stopOnInteraction: false,
                  stopOnMouseEnter: false,
                }),
              ]}
              className="w-full px-12"
            >
              <CarouselContent>
                {featuredProducts.map((product) => (
                  <CarouselItem key={product.id} className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <div className="p-1">
                      <ProductCard product={product} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
<CarouselPrevious className="text-zinc-700 border-zinc-300 cursor-pointer" />
<CarouselNext className="text-zinc-700 border-zinc-300 cursor-pointer" />
            </Carousel>
          )}
        </div>
      </section>

      <section className="bg-white max-w-full px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <span className="text-red-500 uppercase tracking-[0.15em] text-sm font-semibold">Cómo funciona</span>
          <h2 className="mt-4 text-4xl md:text-5xl text-zinc-900 uppercase tracking-[0.05em]" style={{ fontFamily: '"Anton", sans-serif', fontWeight: 400 }}>PEDÍ COMO QUIERAS.</h2>
          <p className="mt-3 max-w-xl text-lg text-zinc-500">
            Lo armás en minutos y lo recibís preparado, exactamente como lo querés.
          </p>

          <ol className="mt-12 space-y-4">
            {[
              { n: "01", t: "Elegí el producto", d: "Vacuno, pollo, cerdo, elaborados o chacinados." },
              { n: "02", t: "Elegí el corte", d: "Fino, medio, grueso, cubos, tiritas, picada o entero. Vos decidís." },
              { n: "03", t: "Elegí la cantidad", d: "Desde 500g hasta lo que necesites. Cantidad personalizada disponible." },
              { n: "04", t: "Servicio EL SUPREMO LISTO", d: "Te lo entregamos cortado, porcionado, separado para freezer y etiquetado." },
              { n: "05", t: "Recibí en tu casa", d: "Envío a domicilio dentro de Marcos Juárez." },
            ].map((s) => (
              <li key={s.n} className="flex gap-5 border border-zinc-200 bg-zinc-50 p-6">
                <span className="text-4xl md:text-5xl text-red-500" style={{ fontFamily: '"Anton", sans-serif', fontWeight: 400 }}>{s.n}</span>
                <div>
                  <h3 className="text-2xl text-zinc-900" style={{ fontFamily: '"Anton", sans-serif', fontWeight: 400 }}>{s.t}</h3>
                  <p className="mt-1 text-zinc-500">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-12 bg-zinc-100 p-8 text-center">
            <h2 className="text-3xl md:text-4xl text-zinc-900" style={{ fontFamily: '"Anton", sans-serif', fontWeight: 400 }}>¿Listo para tu primer pedido?</h2>
            <Link to="/productos" className="mt-4 inline-block bg-red-600 px-6 py-3 font-bold uppercase tracking-wider text-white hover:bg-red-700">
              Ver productos
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
