import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { combosApi } from '../../api/combos';
import { getProductImageUrl } from '../../api/storage';
import type { Combo } from '../../types';
import { Button } from '@/components/ui/button';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { formatARS } from '@/lib/utils';

export default function CombosAdmin() {
  const navigate = useNavigate();
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    combosApi.list().then(setCombos).finally(() => setLoading(false));
  }, []);

  const toggle = async (id: number, patch: { isActive?: boolean; isFeatured?: boolean }) => {
    await combosApi.updateVisibility(id, patch);
    setCombos((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              isActive: patch.isActive ?? c.isActive,
              isFeatured: patch.isFeatured ?? c.isFeatured,
            }
          : c,
      ),
    );
  };

  const handleDelete = async (combo: Combo) => {
    if (!confirm(`¿Eliminar el combo "${combo.name}"? Las configuraciones asociadas también se eliminan.`)) return;
    setDeleting(combo.id);
    try {
      await combosApi.remove(combo.id);
      setCombos((prev) => prev.filter((c) => c.id !== combo.id));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Combos</h2>
          <p className="text-sm text-muted-foreground">Diseñá combos personalizables desde la tienda</p>
        </div>
        <Button onClick={() => navigate('/admin/combos/new')}>
          <Plus className="h-4 w-4 mr-1" /> Nuevo combo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Combo</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>KG</TableHead>
                  <TableHead>En-vío</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {combos.map((combo) => (
                  <TableRow key={combo.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-zinc-900">
                          {combo.image ? (
                            <img src={getProductImageUrl(combo.image)} alt={combo.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-lg">🥩</div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{combo.name}</p>
                          <p className="text-xs text-muted-foreground">/{combo.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatARS(combo.price)}</TableCell>
                    <TableCell>{combo.totalKg} kg</TableCell>
                    <TableCell>
                      <Badge variant={combo.freeShipping ? 'default' : 'outline'}>
                        {combo.freeShipping ? 'Gratis' : 'Cobrar'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1.5">
                        <Badge
                          variant={combo.isActive ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => toggle(combo.id, { isActive: !combo.isActive })}
                        >
                          {combo.isActive ? 'Visible' : 'Oculta'}
                        </Badge>
                        <Badge
                          variant={combo.isFeatured ? 'default' : 'outline'}
                          className={combo.isFeatured ? 'cursor-pointer bg-red-600 hover:bg-red-700' : 'cursor-pointer'}
                          onClick={() => toggle(combo.id, { isFeatured: !combo.isFeatured })}
                        >
                          {combo.isFeatured ? '★ Destacado' : 'Destacar'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1.5">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/admin/combos/${combo.id}`)}>
                          <Pencil className="h-3.5 w-3.5 mr-1" /> Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          disabled={deleting === combo.id}
                          onClick={() => handleDelete(combo)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}