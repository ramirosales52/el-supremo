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
import {
  ChevronLeft, ChevronDown, ChevronUp, ChevronRight, Package, Plus, Trash2,
  ArrowDownToLine, Upload, X,
} from 'lucide-react';

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
  price: number | '';
  totalKg: number | '';
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
    price: '',
    totalKg: '',
    image: '',
    isActive: true,
    isFeatured: false,
    sortOrder: 0,
    freeShipping: true,
    components: [],
  };
}

// El kind lo deduce el backend a partir de las opciones: un grupo de
// "preparación" solo tiene cortes (sin producto asociado). El admin no
// necesita elegirlo.
function deriveKind(options: OptState[]): 'choice' | 'preparation' {
  return options.length > 0 && options.every((o) => o.productId === '' || o.productId === null)
    ? 'preparation'
    : 'choice';
}

function buildPayload(form: FormState): any {
  let k = 0; // claves globales: el SQL resuelve parentOptionKey dentro de tablas temp
  return {
    id: form.id,
    name: form.name,
    slug: form.slug || slugify(form.name),
    description: form.description,
    price: form.price === '' ? 0 : form.price,
    totalKg: form.totalKg === '' ? 0 : form.totalKg,
    image: form.image || null,
    isActive: form.isActive,
    isFeatured: form.isFeatured,
    sortOrder: form.sortOrder,
    freeShipping: form.freeShipping,
    components: form.components.map((comp, ci) => {
      const optKeyByUid = new Map<number, string>();
      const groups: any[] = [];

      // árbol: hijos por opción padre ('' = raíz)
      const kids = new Map<number | '', GrpState[]>();
      for (const g of comp.groups) {
        const parent = g.parentOptionUid === '' ? ('') as number | '' : g.parentOptionUid;
        if (!kids.has(parent)) kids.set(parent, []);
        kids.get(parent)!.push(g);
      }

      const emitGroup = (grp: GrpState, gi: number, parentKey: string | undefined) => {
        k += 1;
        const gKey = `g${k}`;
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
        groups.push({
          key: gKey,
          name: grp.name,
          kind: deriveKind(grp.options),
          sortOrder: gi,
          parentOptionKey: parentKey,
          options,
        });
        // las preguntas hijas salen después de la opción que las dispara
        for (const o of grp.options) {
          (kids.get(o.uid) ?? []).forEach((child, oi2) => emitGroup(child, oi2, optKeyByUid.get(o.uid)));
        }
      };

      (kids.get('') ?? []).forEach((g, gi) => emitGroup(g, gi, undefined));

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

const unitOptions = [
  { value: 'kg', label: 'Kilogramos (kg)' },
  { value: 'g', label: 'Gramos (g)' },
  { value: 'unidad', label: 'Unidades' },
];

const unitLabel = (u: string) => unitOptions.find((o) => o.value === u)?.label ?? u;

// Elimina un subárbol: grupos huérfanos (cuyo padre es una opción borrada)
// y sus descendientes.
function pruneGroupTree(
  groups: GrpState[],
  goneGroups: number[],
  goneOptions: number[],
): GrpState[] {
  const goneGroupSet = new Set<number | ''>(goneGroups);
  const goneOptionSet = new Set<number | ''>(goneOptions);
  const orphans: number[] = [];
  const keep: GrpState[] = [];
  for (const g of groups) {
    if (goneGroupSet.has(g.uid) || goneOptionSet.has(g.parentOptionUid)) {
      for (const o of g.options) orphans.push(o.uid);
      continue;
    }
    keep.push(g);
  }
  if (orphans.length === 0) return keep;
  return pruneGroupTree(keep, goneGroups, orphans);
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
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const uidRef = useRef(1);
  const nextUid = () => uidRef.current++;

  function fromCombo(combo: Combo): FormState {
    const uidByOptionId = new Map<number, number>();
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
        groups: [],
      })),
    };
    for (const comp of next.components) {
      const dbComp = combo.components.find((cc) => cc.id === comp.id);
      uidByOptionId.clear();
      for (const g of dbComp?.groups ?? []) {
        const grp: GrpState = {
          uid: nextUid(),
          id: g.id,
          name: g.name,
          parentOptionUid: g.parentOptionId != null ? uidByOptionId.get(g.parentOptionId) ?? '' : '',
          options: g.options.map((o) => {
            const uid = nextUid();
            uidByOptionId.set(o.id, uid);
            return {
              uid,
              id: o.id,
              name: o.name,
              productId: o.productId ?? '',
              cutOptionId: o.cutOptionId ?? '',
              isActive: o.isActive,
            };
          }),
        };
        comp.groups.push(grp);
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

  const productName = (pid: number | '') => (pid === '' ? '' : products.find((p) => p.id === pid)?.name ?? '');
  const cutName = (cid: number | '') => (cid === '' ? '' : cutOptions.find((c) => c.id === cid)?.name ?? '');

  // ---- componentes (pasos) ----
  const addComponent = () => {
    const uid = nextUid();
    const comp: CompState = { uid, name: '', quantity: 1, unit: 'kg', dayLabel: '', fixedProductId: '', groups: [] };
    setForm((f) => ({ ...f, components: [...f.components, comp] }));
    setExpanded((e) => ({ ...e, [uid]: true }));
  };

  const updateComponent = (uid: number, patch: Partial<CompState>) =>
    setForm((f) => ({
      ...f,
      components: f.components.map((c) => (c.uid === uid ? { ...c, ...patch } : c)),
    }));

  const removeComponent = (uid: number) =>
    setForm((f) => ({ ...f, components: f.components.filter((c) => c.uid !== uid) }));

  const moveComponent = (uid: number, dir: -1 | 1) =>
    setForm((f) => {
      const idx = f.components.findIndex((c) => c.uid === uid);
      const target = idx + dir;
      if (idx < 0 || target < 0 || target >= f.components.length) return f;
      const comps = [...f.components];
      [comps[idx], comps[target]] = [comps[target], comps[idx]];
      return { ...f, components: comps };
    });

  // ---- preguntas ----
  const addGroup = (compUid: number, parentOptionUid: number | '') => {
    const grp: GrpState = { uid: nextUid(), name: '', parentOptionUid, options: [] };
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
        c.uid === compUid ? { ...c, groups: pruneGroupTree(c.groups, [grpUid], []) } : c,
      ),
    }));

  const moveGroup = (compUid: number, grpUid: number, dir: -1 | 1) =>
    setForm((f) => {
      const comp = f.components.find((c) => c.uid === compUid);
      if (!comp) return f;
      const grp = comp.groups.find((g) => g.uid === grpUid);
      if (!grp) return f;
      const sibs = comp.groups.filter((g) => g.parentOptionUid === grp.parentOptionUid);
      const idx = sibs.findIndex((g) => g.uid === grpUid);
      const target = idx + dir;
      if (target < 0 || target >= sibs.length) return f;
      const a = comp.groups.indexOf(grp);
      const b = comp.groups.indexOf(sibs[target]);
      const groups = [...comp.groups];
      [groups[a], groups[b]] = [groups[b], groups[a]];
      return {
        ...f,
        components: f.components.map((c) => (c.uid === compUid ? { ...c, groups } : c)),
      };
    });

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
                          ? {
                              ...o,
                              ...patch,
                              cutOptionId:
                                patch.productId !== undefined
                                  ? ''
                                  : patch.cutOptionId !== undefined
                                    ? patch.cutOptionId
                                    : o.cutOptionId,
                            }
                          : o,
                      ),
                    }
                  : g,
              ),
            }
          : c,
      ),
    }));

  const removeOptionWithTree = (compUid: number, grpUid: number, optUid: number) =>
    setForm((f) => ({
      ...f,
      components: f.components.map((c) =>
        c.uid === compUid
          ? {
              ...c,
              groups: pruneGroupTree(c.groups, [], [optUid]).map((g) =>
                g.uid === grpUid ? { ...g, options: g.options.filter((o) => o.uid !== optUid) } : g,
              ),
            }
          : c,
      ),
    }));

  const moveOption = (compUid: number, grpUid: number, optUid: number, dir: -1 | 1) =>
    setForm((f) => ({
      ...f,
      components: f.components.map((c) =>
        c.uid === compUid
          ? {
              ...c,
              groups: c.groups.map((g) => {
                if (g.uid !== grpUid) return g;
                const idx = g.options.findIndex((o) => o.uid === optUid);
                const target = idx + dir;
                if (target < 0 || target >= g.options.length) return g;
                const options = [...g.options];
                [options[idx], options[target]] = [options[target], options[idx]];
                return { ...g, options };
              }),
            }
          : c,
      ),
    }));

  const handleProductChange = (compUid: number, grpUid: number, opt: OptState, value: number | '') => {
    const oldName = productName(opt.productId) || cutName(opt.cutOptionId);
    const newName = value === '' ? opt.name : productName(value);
    const name = value !== '' && (opt.name === '' || opt.name === oldName) ? newName : opt.name;
    updateOption(compUid, grpUid, opt.uid, { productId: value, name });
  };

  const handleCutChange = (compUid: number, grpUid: number, opt: OptState, value: number | '') => {
    const oldName = cutName(opt.cutOptionId) || productName(opt.productId);
    const newName = value === '' ? opt.name : cutName(value);
    const name = value !== '' && (opt.name === '' || opt.name === oldName) ? newName : opt.name;
    updateOption(compUid, grpUid, opt.uid, { cutOptionId: value, name });
  };

  const cutOptionsForProduct = (pid: number | '') => {
    if (pid === '') return cutOptions;
    const product = products.find((p) => p.id === pid);
    if (product && product.cutOptions?.length) return product.cutOptions;
    return cutOptions;
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

  const stepSummary = (comp: CompState) => {
    const parts: string[] = [];
    if (comp.fixedProductId !== '') parts.push('producto fijo');
    const qty = `${comp.quantity} ${unitLabel(comp.unit).replace(/\(.*\)/, '').trim()}`;
    if (comp.groups.length > 0) parts.push(`${comp.groups.length} pregunta${comp.groups.length > 1 ? 's' : ''}`);
    if (comp.name) parts.unshift(qty);
    return parts.join(' · ');
  };

  // renderiza una pregunta y sus opciones (con hijas anidadas)
  const renderQuestion = (comp: CompState, grp: GrpState, depth: number) => {
    if (depth > 6) {
      return (
        <p key={grp.uid} className="text-xs text-destructive">
          Demasiados niveles anidados en esta pregunta.
        </p>
      );
    }
    const isPrep = deriveKind(grp.options) === 'preparation';
    const sibs = comp.groups.filter((g) => g.parentOptionUid === grp.parentOptionUid);
    const sibIdx = sibs.findIndex((g) => g.uid === grp.uid);
    return (
      <div
        key={grp.uid}
        className={depth > 0 ? 'space-y-2' : 'rounded-md border border-input bg-muted/30 p-3 space-y-3'}
      >
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded text-xs font-bold ${isPrep ? 'bg-amber-100 text-amber-700' : 'bg-gray-800 text-white'}`}>
            {isPrep ? 'Prep' : 'Preg'}
          </div>
          <Input
            value={grp.name}
            onChange={(e) => updateGroup(comp.uid, grp.uid, { name: e.target.value })}
            placeholder={isPrep ? '¿Cómo se prepara? (ej: Elegí la preparación)' : 'Hacé la pregunta (ej: Elegí el corte)'}
            className="h-9"
          />
          <div className="flex shrink-0 items-center gap-1">
            <Button variant="ghost" size="icon-sm" disabled={sibIdx <= 0} onClick={() => moveGroup(comp.uid, grp.uid, -1)}>
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" disabled={sibIdx >= sibs.length - 1} onClick={() => moveGroup(comp.uid, grp.uid, 1)}>
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive"
              onClick={() => {
                if (confirm(`¿Eliminar esta pregunta y sus opciones? Sus preguntas anidadas también se eliminan.`)) {
                  removeGroup(comp.uid, grp.uid);
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {grp.options.length === 0 && (
            <p className="text-xs text-muted-foreground">
              {isPrep
                ? 'Agregá las preparaciones disponibles (ej: Bife fino, Bife grueso).'
                : 'Agregá las opciones que puede elegir (ej: Pollo, Cerdo).'}
            </p>
          )}
          {grp.options.map((opt, oi) => {
            const optProduct = products.find((p) => p.id === opt.productId);
            const optCut = cutOptionsForProduct(opt.productId).find((c) => c.id === opt.cutOptionId);
            return (
              <div key={opt.uid} className="space-y-2">
                <div className="grid gap-2 rounded border border-muted bg-white px-2 py-2 items-center sm:grid-cols-12">
                  <div className="sm:col-span-3">
                    <Select
                      value={String(opt.productId === '' ? 'all' : opt.productId)}
                      onValueChange={(v) => handleProductChange(comp.uid, grp.uid, opt, v === 'all' ? '' : Number(v))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue>
                          {opt.productId === '' ? '— Producto —' : (optProduct?.name ?? String(opt.productId))}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">— Sin producto —</SelectItem>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-3">
                    <Select
                      value={String(opt.cutOptionId === '' ? 'all' : opt.cutOptionId)}
                      onValueChange={(v) => handleCutChange(comp.uid, grp.uid, opt, v === 'all' ? '' : Number(v))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue>
                          {opt.cutOptionId === '' ? '— Corte —' : (optCut?.name ?? String(opt.cutOptionId))}
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
                  <div className="sm:col-span-3">
                    <Input
                      value={opt.name}
                      onChange={(e) => updateOption(comp.uid, grp.uid, opt.uid, { name: e.target.value })}
                      placeholder={optProduct?.name ?? optCut?.name ?? 'Nombre de la opción'}
                    />
                  </div>
                  <div className="flex items-center justify-end gap-1 sm:col-span-3">
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Checkbox
                        checked={opt.isActive}
                        onCheckedChange={(v) => updateOption(comp.uid, grp.uid, opt.uid, { isActive: Boolean(v) })}
                      />
                      Activa
                    </label>
                    <Button variant="ghost" size="icon-sm" disabled={oi <= 0} onClick={() => moveOption(comp.uid, grp.uid, opt.uid, -1)}>
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" disabled={oi >= grp.options.length - 1} onClick={() => moveOption(comp.uid, grp.uid, opt.uid, 1)}>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive"
                      onClick={() => removeOptionWithTree(comp.uid, grp.uid, opt.uid)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {depth === 0 && (
                  <div className="flex items-center gap-1.5 pl-1 text-xs text-muted-foreground">
                    <Button variant="ghost" size="sm" className="h-6 px-1.5 text-xs" onClick={() => addGroup(comp.uid, opt.uid)}>
                      <Plus className="h-3 w-3 mr-1" />
                      Pregunta si elige esta opción
                    </Button>
                  </div>
                )}

                {renderTree(comp, opt.uid, depth + 1)}
              </div>
            );
          })}
          <Button variant="outline" size="sm" onClick={() => addOption(comp.uid, grp.uid)}>
            <Plus className="h-4 w-4 mr-1" /> Opción
          </Button>
        </div>
      </div>
    );
  };

  const renderTree = (comp: CompState, parentOptionUid: number | '', depth: number) => {
    const kids = comp.groups.filter((g) => g.parentOptionUid === parentOptionUid);
    if (kids.length === 0) return null;
    const inner = (
      <div className="space-y-2">
        {kids.map((g) => renderQuestion(comp, g, depth))}
      </div>
    );
    if (parentOptionUid === '') return inner;
    return <div className="ml-2 border-l-2 border-gray-200 pl-3">{inner}</div>;
  };

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
            <Label>Precio</Label>
            <Input type="number" value={form.price} onChange={(e) => set('price', e.target.value === '' ? '' : Number(e.target.value))} />
          </div>
          <div>
            <Label>Peso total (kg)</Label>
            <Input type="number" step="0.1" value={form.totalKg} onChange={(e) => set('totalKg', e.target.value === '' ? '' : Number(e.target.value))} />
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
            <CardTitle>Pasos del combo</CardTitle>
            <CardDescription>
              Cada paso le pide al cliente elegir algo, o incluye un producto fijo. Una opción puede abrir una sola pregunta siguiente (ej: elegida la milanesa, ¿cómo la preparamos?).
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={addComponent}>
            <Plus className="h-4 w-4 mr-1" /> Agregar paso
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {form.components.length === 0 && (
            <p className="text-sm text-muted-foreground">Sin pasos todavía. Agregá el primero para armar el combo.</p>
          )}

          {form.components.map((comp, gi) => {
            const isOpen = expanded[comp.uid] !== false;
            const rootCount = comp.groups.filter((g) => g.parentOptionUid === '').length;
            return (
              <div key={comp.uid} className="rounded-lg border bg-white">
                <div className="flex items-center gap-2 p-3">
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground cursor-pointer"
                    onClick={() => setExpanded((e) => ({ ...e, [comp.uid]: !(e[comp.uid] !== false) }))}
                  >
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-gray-900 text-white">
                    <Package className="h-3.5 w-3.5" />
                  </span>
                  <Input
                    value={comp.name}
                    onChange={(e) => updateComponent(comp.uid, { name: e.target.value })}
                    placeholder="Nombre del paso (ej: Bifes)"
                    className="h-9"
                  />
                  {!isOpen && comp.name && <span className="shrink-0 text-xs text-muted-foreground">{stepSummary(comp)}</span>}
                  <div className="flex shrink-0 items-center gap-1">
                    <Button variant="ghost" size="icon-sm" disabled={gi <= 0} onClick={() => moveComponent(comp.uid, -1)}>
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" disabled={gi >= form.components.length - 1} onClick={() => moveComponent(comp.uid, 1)}>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive"
                      onClick={() => {
                        if (confirm(`¿Eliminar el paso "${comp.name || 'sin nombre'}" y todas sus preguntas?`)) {
                          removeComponent(comp.uid);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {isOpen && (
                  <div className="space-y-4 border-t p-4">
                    <div className="grid gap-3 sm:grid-cols-4">
                      <div>
                        <Label>Cantidad</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={comp.quantity}
                          onChange={(e) => updateComponent(comp.uid, { quantity: e.target.value === '' ? 0 : Number(e.target.value) })}
                          placeholder="0.5"
                        />
                      </div>
                      <div>
                        <Label>Unidad</Label>
                        <Select value={comp.unit} onValueChange={(v) => updateComponent(comp.uid, { unit: v ?? comp.unit })}>
                          <SelectTrigger className="w-full">
                            <SelectValue>{unitLabel(comp.unit)}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {unitOptions.map((u) => (
                                <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Día de la entrega (opcional)</Label>
                        <Input value={comp.dayLabel} onChange={(e) => updateComponent(comp.uid, { dayLabel: e.target.value })} placeholder="ej: Lunes" />
                      </div>
                    </div>

                    <div className="rounded-md bg-muted/40 p-3 space-y-2">
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={comp.fixedProductId !== ''}
                          onCheckedChange={(v) => updateComponent(comp.uid, { fixedProductId: v ? comp.fixedProductId : '' })}
                        />
                        Incluye un producto fijo (se agrega siempre)
                      </label>
                      <Select
                        value={comp.fixedProductId === '' ? 'none' : String(comp.fixedProductId)}
                        onValueChange={(v) => updateComponent(comp.uid, { fixedProductId: v === 'none' ? '' : Number(v) })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            {comp.fixedProductId === ''
                              ? '— Sin producto fijo —'
                              : products.find((p) => p.id === comp.fixedProductId)?.name ?? String(comp.fixedProductId)}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">— Sin producto fijo —</SelectItem>
                          {products.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">
                          {comp.fixedProductId !== '' && rootCount === 0
                            ? 'Preguntas (opcional)'
                            : 'Preguntas al cliente'}
                        </p>
                        <Button variant="outline" size="sm" onClick={() => addGroup(comp.uid, '')}>
                          <Plus className="h-4 w-4 mr-1" /> Pregunta
                        </Button>
                      </div>
                      {comp.groups.length === 0 ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {comp.fixedProductId !== ''
                            ? 'El paso agrega un producto fijo. Si querés preguntar algo (ej: la preparación), agregá una pregunta.'
                            : 'Agregá una pregunta para que el cliente elija (ej: "Elegí el corte").'}
                        </p>
                      ) : (
                        <div className="mt-3 space-y-2">
                          {renderTree(comp, '', 0)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {form.components.length === 0 && (
            <Button variant="outline" className="w-full" onClick={addComponent}>
              <Plus className="h-4 w-4 mr-1" /> Agregar el primer paso
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <ArrowDownToLine className="h-4 w-4 mr-1" />
          {saving ? 'Guardando...' : 'Guardar combo'}
        </Button>
      </div>
    </div>
  );
}