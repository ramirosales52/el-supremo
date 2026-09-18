import { useState, useEffect } from 'react';
import { combosApi } from '../api/combos';
import type { Combo } from '../types';
import ComboCard from '../components/ComboCard';

export default function Combos() {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    combosApi
      .list()
      .then((all) => setCombos(all.filter((c) => c.isActive)))
      .catch((err) => {
        console.error('[combos] list falló:', err);
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los combos');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-black border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <p className="text-red-500 uppercase tracking-[0.2em] text-sm font-semibold">COMBOS</p>
          <h1
            className="text-5xl md:text-6xl text-white uppercase mt-3 leading-[1.05] tracking-[0.02em]"
            style={{ fontFamily: '"Anton", sans-serif', fontWeight: 400 }}
          >
            LISTO PARA<br />LLEVAR
          </h1>
          <p className="text-zinc-400 mt-4 text-lg max-w-xl">
            Combos armados con los mejores cortes. Elegís, personalizás y te llega con envío gratis.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 bg-zinc-100 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-red-600 py-16">{error}</p>
        ) : combos.length === 0 ? (
          <p className="text-center text-zinc-500 py-16">No hay combos disponibles por ahora.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {combos.map((combo) => (
              <ComboCard key={combo.id} combo={combo} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}