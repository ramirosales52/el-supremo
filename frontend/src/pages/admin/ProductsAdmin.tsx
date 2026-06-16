import { useEffect, useState } from 'react';
import { productsApi } from '../../api/products';
import { categoriesApi } from '../../api/categories';
import { cutOptionsApi } from '../../api/cutOptions';
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

export default function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cutOptions, setCutOptions] = useState<CutOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [saving, setSaving] = useState(false);

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
    });
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editing?.name || !editing?.basePrice || !editing?.categoryId) return;
    setSaving(true);
    try {
      const data = {
        ...editing,
        cutOptionIds: editing.cutOptions?.map((c: any) => c.id ?? c) ?? [],
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
        <h2 className="text-xl font-bold">Productos</h2>
        <Button size="sm" onClick={openNew}>
          + Nuevo producto
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditing(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.id ? 'Editar' : 'Nuevo'} producto</DialogTitle>
            <DialogDescription>
              Completá los datos del producto y guardá los cambios.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
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
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead>Cortes</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="text-muted-foreground">{p.category.name}</TableCell>
                <TableCell className="text-right font-medium">
                  ${Number(p.basePrice).toFixed(2)}
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
