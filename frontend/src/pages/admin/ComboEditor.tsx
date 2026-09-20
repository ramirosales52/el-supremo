import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { combosApi, parseComboError } from '../../api/combos';
import { productsApi } from '../../api/products';
import { cutOptionsApi } from '../../api/cutOptions';
import { uploadProductImage, getProductImageUrl } from '../../api/storage';
import type { Combo, Product, CutOption } from '../../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, Plus, Trash2, ArrowDownToLine, Upload, X } from 'lucide-react';

interface OptState {
  uid: number;
  id?: number;
  name: string;
  productId: number | '';
  cutOptionId: number | '';
  isActive: boolean;
}

interface GrpState {
  uid: number;
  id?: number;
  name: string;
  kind: 'choice' | 'preparation';
  parentOptionUid: number | '';
  options: OptState[];
}

interface CompState {
  uid: number;
  id?: number;
  name: string;
  quantity: number;
  unit: string;
  dayLabel: string;
  fixedProductId: number | '';
  groups: GrpState[];
}

interface FormState {
  id?: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  totalKg: number;
  image: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  freeShipping: boolean;
  components: CompState[];
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function blankForm(): FormState {
  return {
    name: '',
    slug: '',
    description: '',
    price: 0,
    totalKg: 0,
    image: '',
    isActive: true,
    isFeatured: false,
    sortOrder: 0,
    freeShipping: true,
    components: [],
  };
}

function buildPayload(form: FormState): any {
  let k = 0; // keys globales: el SQL resuelve parentOptionKey dentro de tablas temp globales
  return {
    id: form.id,
    name: form.name,
    slug: form.slug || slugify(form.name),
    description: form.description,
    price: form.price,
    totalKg: form.totalKg,
    image: form.image || null,
    isActive: form.isActive,
    isFeatured: form.isFeatured,
    sortOrder: form.sortOrder,
    freeShipping: form.freeShipping,
    components: form.components.map((comp, ci) => {
      const groups = comp.groups.map((grp, gi) => {
        k += 1;
        const gKey = `g${k}`;
        const optKeyByUid = new Map<number, string>();
        const options = grp.options.map((o, oi) => {
          k += 1;
          const oKey = `o${k}`;
          optKeyByUid.set(o.uid, oKey);
          return {
            key: oKey,
            name: o.name,
            productId: o.productId === '' ? null : o.productId,
            cutOptionId: o.cutOptionId === '' ? null : o.cutOptionId,
            isActive: o.isActive,
            sortOrder: oi,
          };
        });
        return {
          key: gKey,
          name: grp.name,
          kind: grp.kind,
          sortOrder: gi,
          parentOptionKey: grp.parentOptionUid === '' ? undefined : optKeyByUid.get(grp.parentOptionUid),
          options,
        };
      });
      return {
        name: comp.name,
        quantity: comp.quantity,
        unit: comp.unit,
        sortOrder: ci,
        fixedProductId: comp.fixedProductId === '' ? null : comp.fixedProductId,
        dayLabel: comp.dayLabel || null,
        groups,
      };
    }),
  };
}

export default function ComboEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const [form, setForm] = useState<FormState>(blankForm());
  const [products, setProducts] = useState<Product[]>([]);
  const [cutOptions, setCutOptions] = useState<CutOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const uidRef = useRef(1);
  const nextUid = () => uidRef.current++;

  function fromCombo(combo: Combo): FormState {
    const next: FormState = {
      id: combo.id,
      name: combo.name,
      slug: combo.slug,
      description: combo.description,
      price: Number(combo.price),
      totalKg: Number(combo.totalKg),
      image: combo.image ?? '',
      isActive: combo.isActive,
      isFeatured: combo.isFeatured,
      sortOrder: combo.sortOrder,
      freeShipping: combo.freeShipping,
      components: combo.components.map((c) => ({
        uid: nextUid(),
        id: c.id,
        name: c.name,
        quantity: Number(c.quantity),
        unit: c.unit,
        dayLabel: c.dayLabel ?? '',
        fixedProductId: c.fixedProductId ?? '',
        groups: c.groups.map((g) => ({
          uid: nextUid(),
          id: g.id,
          name: g.name,
          kind: g.kind,
          parentOptionUid: '',
          options: g.options.map((o) => ({
            uid: nextUid(),
            id: o.id,
            name: o.name,
            productId: o.productId ?? '',
            cutOptionId: o.cutOptionId ?? '',
            isActive: o.isActive,
          })),
        })),
      })),
    };
    for (const comp of next.components) {
      for (let gi = 0; gi < comp.groups.length; gi++) {
        const grp = comp.groups[gi];
        const dbGrp = combo.components.find((cc) => cc.id === comp.id)?.groups[gi];
        if (dbGrp?.parentOptionId != null) {
          const uid = comp.groups
            .slice(0, gi)
            .flatMap((pg) => pg.options)
            .find((o) => o.id === dbGrp.parentOptionId)?.uid;
          grp.parentOptionUid = uid ?? '';
        }
      }
    }
    return next;
  }

  useEffect(() => {
    let cancelled = false;
    Promise.all([productsApi.getAllAdmin(), cutOptionsApi.getAll()])
      .then(([p, co]) => {
        setProducts(p);
        setCutOptions(co);
      })
      .then(async () => {
        if (isNew) {
          if (!cancelled) setLoading(false);
          return;
        }
        const combos = await combosApi.list();
        const combo = combos.find((c) => c.id === Number(id));
        if (combo && !cancelled) {
          setForm(fromCombo(combo));
          setImagePreview(combo.image ? getProductImageUrl(combo.image) : null);
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Error al cargar'))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const handleNameChange = (name: string) => {
    setForm((f) => ({
      ...f,
      name,
      slug: f.slug === '' || f.slug === slugify(f.name) ? slugify(name) : f.slug,
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    set('image', '');
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    set('image', '');
  };

  // ---- componentes ----
  const addComponent = () => {
    const comp: CompState = { uid: nextUid(), name: '', quantity: 0, unit: 'g', dayLabel: '', fixedProductId: '', groups: [] };
    setForm((f) => ({ ...f, components: [...f.components, comp] }));
  };

  const updateComponent = (uid: number, patch: Partial<CompState>) =>
    setForm((f) => ({
      ...f,
      components: f.components.map((c) => (c.uid === uid ? { ...c, ...patch } : c)),
    }));

  const removeComponent = (uid: number) =>
    setForm((f) => ({ ...f, components: f.components.filter((c) => c.uid !== uid) }));

  // ---- grupos ----
  const addGroup = (compUid: number) => {
    const grp: GrpState = { uid: nextUid(), name: '', kind: 'choice', parentOptionUid: '', options: [] };
    setForm((f) => ({
      ...f,
      components: f.components.map((c) => (c.uid === compUid ? { ...c, groups: [...c.groups, grp] } : c)),
    }));
  };

  const updateGroup = (compUid: number, grpUid: number, patch: Partial<GrpState>) =>
    setForm((f) => ({
      ...f,
      components: f.components.map((c) =>
        c.uid === compUid ? { ...c, groups: c.groups.map((g) => (g.uid === grpUid ? { ...g, ...patch } : g)) } : c,
      ),
    }));

  const removeGroup = (compUid: number, grpUid: number) =>
    setForm((f) => ({
      ...f,
      components: f.components.map((c) =>
        c.uid === compUid ? { ...c, groups: c.groups.filter((g) => g.uid !== grpUid) } : c,
      ),
    }));

  // ---- opciones ----
  const addOption = (compUid: number, grpUid: number) => {
    const opt: OptState = { uid: nextUid(), name: '', productId: '', cutOptionId: '', isActive: true };
    setForm((f) => ({
      ...f,
      components: f.components.map((c) =>
        c.uid === compUid
          ? { ...c, groups: c.groups.map((g) => (g.uid === grpUid ? { ...g, options: [...g.options, opt] } : g)) }
          : c,
      ),
    }));
  };

  const updateOption = (compUid: number, grpUid: number, optUid: number, patch: Partial<OptState>) =>
    setForm((f) => ({
      ...f,
      components: f.components.map((c) =>
        c.uid === compUid
          ? {
              ...c,
              groups: c.groups.map((g) =>
                g.uid === grpUid
                  ? {
                      ...g,
                      options: g.options.map((o) =>
                        o.uid === optUid
                          ? { ...o, ...patch, cutOptionId: patch.productId !== undefined ? '' : o.cutOptionId }
                          : o,
                      ),
                    }
                  : g,
              ),
            }
          : c,
      ),
    }));

  const removeOption = (compUid: number, grpUid: number, optUid: number) =>
    setForm((f) => ({
      ...f,
      components: f.components.map((c) =>
        c.uid === compUid
          ? { ...c, groups: c.groups.map((g) => (g.uid === grpUid ? { ...g, options: g.options.filter((o) => o.uid !== optUid) } : g)) }
          : c,
      ),
    }));

  const parentsFor = (comp: CompState, grp: GrpState) =>
    comp.groups.slice(0, comp.groups.indexOf(grp)).flatMap((g) => g.options);

  const cutOptionsForProduct = (pid: number | '') => {
    if (pid === '') return cutOptions;
    const product = products.find((p) => p.id === pid);
    if (product && product.cutOptions?.length) return product.cutOptions;
    return cutOptions.filter((c) => c.id != null);
  };

  const handleSave = async () => {
    setError('');
    if (!form.name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload(form);
      if (imageFile) {
        const tempId = form.id ?? Date.now();
        payload.image = await uploadProductImage(imageFile, tempId, 0);
      }
      await combosApi.save(payload);
      navigate('/admin/combos');
    } catch (err) {
      setError(parseComboError(err).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => navigate('/admin/combos')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{isNew ? 'Nuevo combo' : `Editar combo · ${form.name}`}</h2>
          <p className="text-sm text-muted-foreground">Los precios los confirma el servidor al comprar</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={() => navigate('/admin/combos')}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar combo'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Datos del combo</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Nombre *</Label>
            <Input value={form.name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Vivo Solo" />
          </div>
          <div className="sm:col-span-2">
            <Label>Descripción</Label>
            <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={2} placeholder="¿Qué incluye?" />
          </div>
          <div>
            <Label>Precio (ARS)</Label>
            <Input type="number" value={form.price} onChange={(e) => set('price', Number(e.target.value))} />
          </div>
          <div>
            <Label>Peso total (kg)</Label>
            <Input type="number" step="0.1" value={form.totalKg} onChange={(e) => set('totalKg', Number(e.target.value))} />
          </div>
          <div className="sm:col-span-2">
            <Label>Imagen</Label>
            {imagePreview ? (
              <div className="relative mt-1 inline-block w-full">
                <img src={imagePreview} alt="Preview" className="h-40 w-full rounded-lg border object-cover" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <label className="mt-1 flex h-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-input bg-background px-2 py-5 text-xs text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground/70">
                <Upload className="h-4 w-4" />
                <span>Subir imagen</span>
                <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              </label>
            )}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={form.isActive} onCheckedChange={(v) => set('isActive', Boolean(v))} />
              Visible
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={form.isFeatured} onCheckedChange={(v) => set('isFeatured', Boolean(v))} />
              Destacado en Home
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={form.freeShipping} onCheckedChange={(v) => set('freeShipping', Boolean(v))} />
              Envío gratis incluido
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Componentes</CardTitle>
            <CardDescription>Cada paso le pide al cliente elegir algo (ej: corte, fiambres…) o incluye un producto fijo.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={addComponent}>
            <Plus className="h-4 w-4 mr-1" /> Agregar componente
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {form.components.length === 0 && (
            <p className="text-sm text-muted-foreground">Sin componentes todavía. Agregá el primero para armar el combo.</p>
          )}
          {form.components.map((comp) => (
            <div key={comp.uid} className="rounded-lg border p-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-6">
                <div className="sm:col-span-2">
                  <Label>Nombre del paso</Label>
                  <Input value={comp.name} onChange={(e) => updateComponent(comp.uid, { name: e.target.value })} placeholder="Qué le pide al cliente (ej: Elegí tu corte)" />
                </div>
                <div>
                  <Label>Cantidad</Label>
                  <Input type="number" value={comp.quantity} onChange={(e) => updateComponent(comp.uid, { quantity: Number(e.target.value) })} placeholder="0.5" />
                </div>
                <div>
                  <Label>Unidad</Label>
                  <Select value={comp.unit} onValueChange={(v) => updateComponent(comp.uid, { unit: v ?? comp.unit })}>
                    <SelectTrigger className="w-full">
                      <SelectValue>{comp.unit === 'kg' ? 'Kilogramos (kg)' : comp.unit === 'unidad' ? 'Unidades' : 'Gramos (g)'}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="g">Gramos (g)</SelectItem>
                        <SelectItem value="kg">Kilogramos (kg)</SelectItem>
                        <SelectItem value="unidad">Unidades</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Día de la semana (opcional)</Label>
                  <Input value={comp.dayLabel} onChange={(e) => updateComponent(comp.uid, { dayLabel: e.target.value })} placeholder="ej: Lunes" />
                </div>
                <div className="flex items-end justify-end">
                  <Button variant="ghost" size="icon-sm" className="text-destructive" onClick={() => removeComponent(comp.uid)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Producto incluido (paso sin opciones)</Label>
                  <Select value={String(comp.fixedProductId === '' ? 'all' : comp.fixedProductId)} onValueChange={(v) => updateComponent(comp.uid, { fixedProductId: v === 'all' ? '' : Number(v) })}>
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {comp.fixedProductId === ''
                          ? '— Sin producto incluido —'
                          : (products.find((p) => p.id === comp.fixedProductId)?.name ?? String(comp.fixedProductId))}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">— Sin producto incluido —</SelectItem>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end justify-end">
                  <Button variant="outline" size="sm" onClick={() => addGroup(comp.uid)}>
                    <Plus className="h-4 w-4 mr-1" /> Agregar grupo de opciones
                  </Button>
                </div>
              </div>

              {comp.groups.map((grp, gi) => {
                const priorOpts = parentsFor(comp, grp);
                const isPrep = grp.kind === 'preparation';
                return (
                  <div key={grp.uid} className="rounded-md bg-muted/40 p-3 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-12">
                      <div className="sm:col-span-3">
                        <Label>Nombre del grupo</Label>
                        <Input value={grp.name} onChange={(e) => updateGroup(comp.uid, grp.uid, { name: e.target.value })} placeholder="ej: Seleccioná la preparación" />
                      </div>
                      <div className="sm:col-span-3">
                        <Label>¿Qué es?</Label>
                        <Select value={grp.kind} onValueChange={(v) => updateGroup(comp.uid, grp.uid, { kind: v as any })}>
                          <SelectTrigger className="w-full">
                            <SelectValue>{isPrep ? 'Preparación' : 'Elección'}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="choice">Elección (el cliente elige una opción)</SelectItem>
                              <SelectItem value="preparation">Preparación (afina el corte elegido)</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="sm:col-span-3">
                        <Label>¿Cuándo aparece?</Label>
                        <Select
                          value={String(grp.parentOptionUid === '' ? 'all' : grp.parentOptionUid)}
                          onValueChange={(v) => updateGroup(comp.uid, grp.uid, { parentOptionUid: v === 'all' ? '' : Number(v) })}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue>
                              {grp.parentOptionUid === ''
                                ? '— Aparece siempre (raíz) —'
                                : (() => {
                                    const po = priorOpts.find((o) => o.uid === grp.parentOptionUid);
                                    return po ? `${grpNameFor(comp, po)} → ${po.name || 'sin nombre'}` : '';
                                  })()}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">— Aparece siempre (raíz) —</SelectItem>
                            {priorOpts.map((o) => (
                              <SelectItem key={o.uid} value={String(o.uid)}>{grpNameFor(comp, o)} → {o.name || 'sin nombre'}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="sm:col-span-3 flex items-end justify-end">
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeGroup(comp.uid, grp.uid)}>
                          <Trash2 className="h-4 w-4 mr-1" /> Quitar grupo
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {grp.options.length === 0 && (
                        <p className="text-xs text-muted-foreground">Sin opciones. {isPrep ? 'Las preparaciones modifican el corte elegido.' : 'Agregá las opciones de este grupo.'}</p>
                      )}
                      {grp.options.map((opt) => {
                          const optProduct = products.find((p) => p.id === opt.productId);
                          const optCut = cutOptionsForProduct(opt.productId).find((c) => c.id === opt.cutOptionId);
                          return (
                        <div key={opt.uid} className="grid gap-3 rounded border bg-white p-2 sm:grid-cols-12 items-center">
                          <div className="sm:col-span-3">
                            <Input value={opt.name} onChange={(e) => updateOption(comp.uid, grp.uid, opt.uid, { name: e.target.value })} placeholder="Tapa de asado" />
                          </div>
                          <div className="sm:col-span-3">
                            <Select
                              value={String(opt.productId === '' ? 'all' : opt.productId)}
                              onValueChange={(v) => updateOption(comp.uid, grp.uid, opt.uid, { productId: v === 'all' ? '' : Number(v) })}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue>
                                  {opt.productId === '' ? '— Producto —' : (optProduct?.name ?? String(opt.productId))}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">— Producto —</SelectItem>
                                {products.map((p) => (
                                  <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="sm:col-span-3">
                            <Select
                              value={String(opt.cutOptionId === '' ? 'all' : opt.cutOptionId)}
                              onValueChange={(v) => updateOption(comp.uid, grp.uid, opt.uid, { cutOptionId: v === 'all' ? '' : Number(v) })}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue>
                                  {opt.cutOptionId === '' ? '— Sin corte —' : (optCut?.name ?? String(opt.cutOptionId))}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">— Sin corte —</SelectItem>
                                {cutOptionsForProduct(opt.productId).map((c) => (
                                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <label className="flex items-center gap-2 text-xs sm:col-span-2">
                            <Checkbox
                              checked={opt.isActive}
                              onCheckedChange={(v) => updateOption(comp.uid, grp.uid, opt.uid, { isActive: Boolean(v) })}
                            />
                            Activa
                          </label>
                          <div className="flex justify-end sm:col-span-1">
                            <Button variant="ghost" size="icon-sm" className="text-destructive" onClick={() => removeOption(comp.uid, grp.uid, opt.uid)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                          );
                        })}
                      <Button variant="outline" size="sm" onClick={() => addOption(comp.uid, grp.uid)}>
                        <Plus className="h-4 w-4 mr-1" /> Opción
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              <ArrowDownToLine className="h-4 w-4 mr-1" />
              {saving ? 'Guardando...' : 'Guardar combo'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function grpNameFor(comp: CompState, opt: OptState): string {
  const g = comp.groups.find((grp) => grp.options.some((o) => o.uid === opt.uid));
  return g?.name || 'grupo';
}