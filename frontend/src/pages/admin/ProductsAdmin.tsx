import { useEffect, useState } from 'react';
import { productsApi } from '../../api/products';
import { categoriesApi } from '../../api/categories';
import { cutOptionsApi } from '../../api/cutOptions';
import { uploadProductImage, getProductImageUrl } from '../../api/storage';
import type { Product, Category, CutOption } from '../../types';
import { Button } from '@/components/ui/button';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Upload, X } from 'lucide-react';

export default function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cutOptions, setCutOptions] = useState<CutOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [saving, setSaving] = useState(false);
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([null, null, null]);
  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([null, null, null]);

  useEffect(() => {
    Promise.all([
      productsApi.getAllAdmin(),
      categoriesApi.getAll(),
      cutOptionsApi.getAll(),
    ])
      .then(([p, c, o]) => {
        setProducts(p);
        setCategories(c);
        setCutOptions(o);
      })
      .finally(() => setLoading(false));
  }, []);

  const openNew = () => {
    setEditing({
      name: '',
      basePrice: 0,
      unit: 'kg',
      categoryId: categories[0]?.id,
      cutOptions: [],
      isAvailable: true,
    });
    setImageFiles([null, null, null]);
    setImagePreviews([null, null, null]);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setImageFiles([null, null, null]);
    setImagePreviews([
      p.images?.[0] ? getProductImageUrl(p.images[0]) : null,
      p.images?.[1] ? getProductImageUrl(p.images[1]) : null,
      p.images?.[2] ? getProductImageUrl(p.images[2]) : null,
    ]);
    setDialogOpen(true);
  };

  const handleImageSelect = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const newFiles = [...imageFiles];
    const newPreviews = [...imagePreviews];
    newFiles[index] = file;
    newPreviews[index] = URL.createObjectURL(file);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const handleRemoveImage = (index: number) => {
    const newFiles = [...imageFiles];
    const newPreviews = [...imagePreviews];
    newFiles[index] = null;
    newPreviews[index] = null;
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
    if (editing) {
      const currentImages = editing.images ?? [];
      const updatedImages = currentImages.filter((_, i) => i !== index);
      setEditing({ ...editing, images: updatedImages.length ? updatedImages : undefined });
    }
  };

  const handleSave = async () => {
    if (!editing?.name || !editing?.basePrice || !editing?.categoryId) return;
    setSaving(true);
    try {
      let images = editing.images ?? [];

      for (let i = 0; i < 3; i++) {
        if (imageFiles[i]) {
          const tempId = editing.id ?? Date.now();
          const path = await uploadProductImage(imageFiles[i]!, tempId, i);
          const newImages = [...images];
          newImages[i] = path;
          images = newImages;
        }
      }

      const { category, cutOptions, ...rest } = editing;
      const data = {
        ...rest,
        images: images.filter(Boolean),
        cutOptionIds: cutOptions?.map((c: any) => c.id ?? c) ?? [],
      };

      if (editing.id) {
        const updated = await productsApi.update(editing.id, data);
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        const created = await productsApi.create(data);
        setProducts((prev) => [...prev, created]);
      }
      setDialogOpen(false);
      setEditing(null);
    setImageFiles([null, null, null]);
    setImagePreviews([null, null, null]);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await productsApi.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {}
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const selectedCutOptions = editing?.cutOptions?.map((c: any) => c.id ?? c) ?? [];

  const toggleCutOption = (opt: CutOption) => {
    const selected = selectedCutOptions.includes(opt.id);
    setEditing({
      ...editing!,
      cutOptions: selected
        ? (editing!.cutOptions as any[])?.filter((c: any) => (c.id ?? c) !== opt.id) ?? []
        : [...(editing!.cutOptions ?? []), opt],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Productos</h2>
        <Button size="sm" onClick={openNew}>
          + Nuevo producto
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditing(null); setImageFiles([null, null, null]); setImagePreviews([null, null, null]); } }}>
        <DialogContent className="sm:max-w-4xl max-w-4xl flex flex-col max-h-[90dvh]">
          <DialogHeader>
            <DialogTitle>{editing?.id ? 'Editar' : 'Nuevo'} producto</DialogTitle>
            <DialogDescription>
              Completá los datos del producto y guardá los cambios.
            </DialogDescription>
          </DialogHeader>
          <div className="-mx-4 overflow-y-auto flex-1 min-h-0">
            <div className="space-y-4 px-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={editing?.name || ''}
                onChange={(e) => setEditing({ ...editing!, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={editing?.description || ''}
                onChange={(e) => setEditing({ ...editing!, description: e.target.value })}
                rows={2}
              />
            </div>

            {/* Images upload (up to 3) */}
            <div className="grid gap-2">
              <Label>Imágenes (máx. 3)</Label>
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map((i) => (
                  <div key={i}>
                    {imagePreviews[i] ? (
                      <div className="relative inline-block w-full">
                        <img
                          src={imagePreviews[i]!}
                          alt={`Preview ${i + 1}`}
                          className="h-28 w-full rounded-lg border object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(i)}
                          className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-input bg-background px-2 py-5 text-xs text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground/70 h-28">
                        <Upload className="h-4 w-4" />
                        <span>{i === 0 ? 'Imagen 1' : i === 1 ? 'Imagen 2' : 'Imagen 3'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect(i)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="price">Precio base</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={editing?.basePrice || 0}
                  onChange={(e) => setEditing({ ...editing!, basePrice: +e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit">Unidad</Label>
                <Select
                  value={editing?.unit || 'kg'}
                  onValueChange={(value) => setEditing({ ...editing!, unit: value ?? 'kg' })}
                >
                  <SelectTrigger id="unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="unidad">unidad</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Categoría</Label>
              <Select
                value={editing?.categoryId != null ? String(editing.categoryId) : ''}
                onValueChange={(value) => setEditing({ ...editing!, categoryId: value ? +value : undefined })}
              >
                <SelectTrigger id="category">
                  <SelectValue>
                    {(value: string | null) => {
                      if (!value) return 'Seleccionar categoría';
                      const cat = categories.find(c => String(c.id) === value);
                      return cat?.name ?? value;
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)} label={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3 py-2">
              <Label className="mb-0">Oferta</Label>
              <button
                type="button"
                onClick={() =>
                  setEditing({
                    ...editing!,
                    isOnSale: !editing?.isOnSale,
                    discountPercentage: editing?.isOnSale ? editing?.discountPercentage : undefined,
                  })
                }
                className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors ${
                  editing?.isOnSale ? 'bg-red-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    editing?.isOnSale ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {editing?.isOnSale && (
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="discount">Descuento (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min={1}
                    max={99}
                    value={editing?.discountPercentage ?? ''}
                    onChange={(e) => setEditing({ ...editing!, discountPercentage: +e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Precio final</Label>
                  <div className="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm font-semibold text-green-700">
                    {editing?.basePrice && editing?.discountPercentage
                      ? `$${(Number(editing.basePrice) * (1 - (editing.discountPercentage || 0) / 100)).toFixed(2)}`
                      : '—'}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 py-2">
              <Label className="mb-0">Disponible</Label>
              <button
                type="button"
                onClick={() =>
                  setEditing({
                    ...editing!,
                    isAvailable: !editing?.isAvailable,
                  })
                }
                className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors ${
                  editing?.isAvailable !== false ? 'bg-green-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    editing?.isAvailable !== false ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-xs text-muted-foreground">
                {editing?.isAvailable !== false ? 'Visible en la tienda' : 'Oculto para clientes'}
              </span>
            </div>

            <div className="grid gap-2">
              <Label>Opciones de corte</Label>
              <div className="flex flex-wrap gap-2">
                {cutOptions.map((opt) => {
                  const selected = selectedCutOptions.includes(opt.id);
                  return (
                    <Button
                      key={opt.id}
                      type="button"
                      variant={selected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleCutOption(opt)}
                    >
                      {opt.name}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancelar</Button>} />
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 text-center">#</TableHead>
              <TableHead className="w-14">Img</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead>Cortes</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p, idx) => (
              <TableRow key={p.id}>
                <TableCell className="text-center text-muted-foreground">{idx + 1}</TableCell>
                <TableCell>
                  <div className="h-10 w-10 overflow-hidden rounded-md bg-muted">
                    {p.images?.[0] ? (
                      <img
                        src={getProductImageUrl(p.images[0])}
                        alt={p.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm">
                        🥩
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {p.name}
                    {!p.isAvailable && (
                      <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500">
                        NO DISPONIBLE
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{p.category.name}</TableCell>
                <TableCell className="text-right font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <span className={p.isOnSale ? 'text-gray-400 line-through' : ''}>
                      ${Number(p.basePrice).toFixed(2)}
                    </span>
                    {p.isOnSale && p.discountPercentage && (
                      <span className="rounded bg-red-600 px-1.5 py-0.5 text-[11px] font-bold text-white">
                        -{p.discountPercentage}%
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {p.cutOptions.map((o) => (
                      <Badge key={o.id} variant="secondary" className="text-xs">
                        {o.name}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="link" size="sm" onClick={() => openEdit(p)}>
                      Editar
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDelete(p.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
