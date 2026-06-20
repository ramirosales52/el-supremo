import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productsApi } from '../api/products';
import { useCart } from '../context/CartContext';
import { formatARS, QUANTITIES_KG, getEffectivePrice, getSalePrice } from '../lib/utils';
import { getProductImageUrl } from '../api/storage';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product, CutOption } from '../types';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCut, setSelectedCut] = useState<CutOption | null>(null);
  const [qty, setQty] = useState(1);
  const [customQty, setCustomQty] = useState(false);
  const [notes, setNotes] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    productsApi.getById(Number(id))
      .then((p) => {
        setProduct(p);
        setSelectedCut(p.cutOptions[0] ?? null);
        document.title = `${p.name} · El Supremo`;
      })
      .finally(() => setLoading(false));
  }, [id]);

  const isUnit = product?.unit === 'unidad';

  const modifier = selectedCut?.priceModifier ?? 0;
  const unitPrice = product ? getEffectivePrice(product, modifier) : 0;
  const finalQty = customQty ? qty : qty;

  const lineTotal = useMemo(
    () => finalQty * unitPrice,
    [finalQty, unitPrice],
  );

  const handleAdd = () => {
    if (!product || finalQty <= 0) return;
    addItem(product, selectedCut, finalQty, notes.trim(), true);
    navigate('/carrito');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted w-1/3" />
            <div className="h-64 bg-muted" />
            <div className="h-6 bg-muted w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <h1 className="font-display text-4xl">Producto no encontrado</h1>
          <Link to="/productos" className="mt-4 inline-block cursor-pointer font-semibold text-primary underline">Volver al catálogo</Link>
        </div>
      </div>
    );
  }

  const hasCuts = product.cutOptions.length > 0;

  return (
    <div className="min-h-screen bg-background">
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      <Link to="/productos" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-primary">
        <ChevronLeft className="h-4 w-4" /> Volver
      </Link>

      <div className="mt-4 grid gap-10 md:grid-cols-[1.1fr_1fr]">
        <div>
          {(product.images?.length ?? 0) > 0 && (
            <div className="mb-6 space-y-3">
              <div className="relative overflow-hidden rounded-lg bg-muted">
                <img
                  src={getProductImageUrl(product.images![selectedImage])}
                  alt={product.name}
                  className="w-full object-cover"
                />
                {(product.images?.length ?? 0) > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setSelectedImage((prev) => (prev === 0 ? product.images!.length - 1 : prev - 1))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-black/40 p-1.5 text-white transition hover:bg-black/60"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedImage((prev) => (prev === product.images!.length - 1 ? 0 : prev + 1))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-black/40 p-1.5 text-white transition hover:bg-black/60"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
              {(product.images?.length ?? 0) > 1 && (
                <div className="flex gap-2">
                  {product.images!.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedImage(i)}
                      className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition cursor-pointer ${
                        selectedImage === i ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={getProductImageUrl(img)}
                        alt={`${product.name} ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <span className="stamp text-primary">{isUnit ? 'Por unidad' : 'Por kilo'}</span>
          <h1 className="mt-3 font-display text-5xl md:text-6xl">{product.name.toUpperCase()}</h1>
          <p className="mt-3 text-lg text-muted-foreground">{product.description}</p>
          <div className="mt-6">
            {product.isOnSale && product.discountPercentage && (
              <span className="inline-block rounded bg-red-600 px-2 py-1 text-xs font-bold text-white mb-2">
                -{product.discountPercentage}%
              </span>
            )}
            <div className="flex items-baseline gap-2">
              {product.isOnSale && product.discountPercentage && (
                <span className="font-display text-2xl text-muted-foreground line-through">
                  {formatARS(Number(product.basePrice) + Number(modifier))}
                </span>
              )}
              <span className="font-display text-5xl text-primary">
                {formatARS(unitPrice)}
              </span>
              <span className="text-xl text-muted-foreground">/ {isUnit ? 'unidad' : 'kg'}</span>
            </div>
          </div>
        </div>

        <aside className="border border-border bg-card p-6 md:sticky md:top-24 md:h-fit">
          <div className="flex items-baseline justify-between">
            <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Total estimado</div>
            <div className="font-display text-3xl text-primary">{formatARS(lineTotal)}</div>
          </div>
          <button
            onClick={handleAdd}
            className="mt-4 w-full cursor-pointer bg-primary px-4 py-3 font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary/90"
          >
            Agregar al pedido
          </button>
          <p className="mt-3 text-center text-xs text-muted-foreground">Envío solo en Marcos Juárez</p>
        </aside>
      </div>

      <div className="mt-12 space-y-10">
        {hasCuts && (
          <Step n={1} title="Elegí el corte">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {product.cutOptions.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCut(c)}
                  className={`cursor-pointer flex items-start justify-between gap-3 border-2 p-4 text-left transition ${
                    selectedCut?.id === c.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:border-primary/40'
                  }`}
                >
                  <div>
                    <div className="font-semibold">{c.name}</div>
                    {c.description && <div className="mt-0.5 text-xs text-muted-foreground">{c.description}</div>}
                    {c.priceModifier != null && c.priceModifier > 0 && (
                      <div className="mt-0.5 text-xs text-primary">+ {formatARS(c.priceModifier)}</div>
                    )}
                  </div>
                  {selectedCut?.id === c.id && <Check className="h-5 w-5 shrink-0 text-primary" />}
                </button>
              ))}
            </div>
          </Step>
        )}
        <Step n={hasCuts ? 2 : 1} title={isUnit ? 'Elegí la cantidad' : 'Elegí el peso'}>
          <div className="flex flex-wrap gap-2">
            {(isUnit ? [1, 2, 3, 4, 5, 6] : QUANTITIES_KG).map((q) => (
              <button
                key={q}
                onClick={() => { setQty(q); setCustomQty(false); }}
                className={`cursor-pointer border-2 px-4 py-3 font-semibold transition ${
                  !customQty && qty === q
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card hover:border-primary/40'
                }`}
              >
                {isUnit ? `${q} u.` : q < 1 ? `${q * 1000} g` : `${q} kg`}
              </button>
            ))}
            <button
              onClick={() => setCustomQty(true)}
              className={`cursor-pointer border-2 px-4 py-3 font-semibold transition ${
                customQty ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:border-primary/40'
              }`}
            >
              Personalizado
            </button>
          </div>
          {customQty && (
            <div className="mt-4 flex items-center gap-3">
              <input
                type="number"
                min={0.5}
                step={0.1}
                value={qty}
                onChange={(e) => setQty(Math.max(0.5, parseFloat(e.target.value) || 0.5))}
                className="w-32 border border-input bg-background px-3 py-2 text-lg font-semibold"
              />
              <span className="text-muted-foreground">{isUnit ? 'unidades' : 'kilos'}</span>
            </div>
          )}
        </Step>

        <Step n={hasCuts ? 3 : 2} title="Aclaraciones (opcional)">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej: porciones de 250g para 2 personas, sin grasa, etc."
            rows={3}
            className="w-full border border-input bg-background px-3 py-2"
          />
        </Step>
      </div>

      <div className="sticky bottom-4 mt-10 md:hidden">
        <button
          onClick={handleAdd}
          className="flex w-full cursor-pointer items-center justify-between bg-primary px-5 py-4 font-bold uppercase tracking-wider text-primary-foreground"
        >
          <span>Agregar · {formatARS(lineTotal)}</span>
          <span>→</span>
        </button>
      </div>
    </div>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center bg-secondary font-display text-secondary-foreground">{n}</span>
        <h2 className="font-display text-2xl md:text-3xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}
