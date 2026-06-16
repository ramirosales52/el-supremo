import { useEffect, useState } from 'react';
import { cutOptionsApi } from '../../api/cutOptions';
import type { CutOption } from '../../types';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';

export default function CutOptionsAdmin() {
  const [options, setOptions] = useState<CutOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<CutOption> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    cutOptionsApi.getAll().then(setOptions).finally(() => setLoading(false));
  }, []);

  const openNew = () => {
    setEditing({ name: '', priceModifier: 0, requiresNotes: false });
    setDialogOpen(true);
  };

  const openEdit = (o: CutOption) => {
    setEditing(o);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editing?.name) return;
    setSaving(true);
    try {
      const data = {
        name: editing.name,
        description: editing.description || undefined,
        priceModifier: editing.priceModifier ? Number(editing.priceModifier) : undefined,
        requiresNotes: editing.requiresNotes ?? false,
      };
      if (editing.id) {
        const updated = await cutOptionsApi.update(editing.id, data);
        setOptions((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      } else {
        const created = await cutOptionsApi.create(data);
        setOptions((prev) => [...prev, created]);
      }
      setDialogOpen(false);
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta opción de corte?')) return;
    try {
      await cutOptionsApi.delete(id);
      setOptions((prev) => prev.filter((o) => o.id !== id));
    } catch {}
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Opciones de Corte</h2>
        <Button size="sm" onClick={openNew}>
          + Nueva opción
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditing(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? 'Editar' : 'Nueva'} opción</DialogTitle>
            <DialogDescription>
              Completá los datos de la opción de corte y guardá los cambios.
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
            <div className="grid gap-2">
              <Label htmlFor="priceModifier">
                Modificador de precio{' '}
                <span className="text-xs text-muted-foreground">(opcional, en $)</span>
              </Label>
              <Input
                id="priceModifier"
                type="number"
                step="0.01"
                value={editing?.priceModifier ?? ''}
                onChange={(e) =>
                  setEditing({
                    ...editing!,
                    priceModifier: e.target.value ? +e.target.value : null,
                  })
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="requiresNotes"
                checked={editing?.requiresNotes ?? false}
                onCheckedChange={(checked) =>
                  setEditing({ ...editing!, requiresNotes: checked === true })
                }
              />
              <Label htmlFor="requiresNotes" className="font-normal">
                Requiere instrucciones adicionales
              </Label>
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
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Precio +</TableHead>
              <TableHead className="text-center">Requiere Notas</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {options.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-medium">{o.name}</TableCell>
                <TableCell className="text-muted-foreground">{o.description || '—'}</TableCell>
                <TableCell className="text-right font-medium">
                  {o.priceModifier ? `+$${o.priceModifier}` : '—'}
                </TableCell>
                <TableCell className="text-center">
                  {o.requiresNotes ? '✅' : '—'}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="link" size="sm" onClick={() => openEdit(o)}>
                    Editar
                  </Button>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-destructive"
                    onClick={() => handleDelete(o.id)}
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
