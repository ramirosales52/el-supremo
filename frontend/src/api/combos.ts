import { supabase } from '../utils/supabase';
import type {
  Combo,
  ComboOption,
  ComboSelectionGroup,
  ComboComponent,
  ComboSnapshot,
  ComboSelectionPayload,
} from '../types';

function mapOption(raw: any): ComboOption {
  return {
    id: raw.id,
    name: raw.name,
    productId: raw.productId ?? null,
    productName: raw.productName ?? raw.product?.name ?? null,
    productAvailable: raw.productAvailable ?? raw.product?.isAvailable ?? null,
    cutOptionId: raw.cutOptionId ?? null,
    cutOptionName: raw.cutOptionName ?? raw.cutOption?.name ?? null,
    isActive: raw.isActive,
    sortOrder: raw.sortOrder,
  };
}

function mapGroup(raw: any): ComboSelectionGroup {
  return {
    id: raw.id,
    name: raw.name,
    kind: raw.kind,
    sortOrder: raw.sortOrder,
    parentOptionId: raw.parentOptionId ?? null,
    options: (raw.options ?? []).map(mapOption),
  };
}

function mapComponent(raw: any): ComboComponent {
  return {
    id: raw.id,
    name: raw.name,
    quantity: Number(raw.quantity),
    unit: raw.unit,
    sortOrder: raw.sortOrder,
    fixedProductId: raw.fixedProductId ?? null,
    fixedProductName: raw.fixedProductName ?? raw.fixedProduct?.name ?? null,
    dayLabel: raw.dayLabel ?? null,
    groups: (raw.groups ?? []).map(mapGroup),
  };
}

export function mapCombo(raw: any): Combo {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description ?? '',
    tagline: raw.tagline ?? '',
    price: Number(raw.price),
    totalKg: Number(raw.totalKg),
    image: raw.image ?? null,
    isActive: raw.isActive,
    isFeatured: raw.isFeatured,
    sortOrder: raw.sortOrder,
    freeShipping: raw.freeShipping,
    variantGroup: raw.variantGroup ?? null,
    variantLabel: raw.variantLabel ?? null,
    components: (raw.components ?? []).map(mapComponent),
  };
}

export function mapSnapshot(raw: any): ComboSnapshot {
  return {
    comboId: raw.comboId,
    comboName: raw.comboName,
    slug: raw.slug,
    description: raw.description ?? '',
    price: Number(raw.price),
    totalKg: Number(raw.totalKg),
    freeShipping: raw.freeShipping,
    image: raw.image ?? null,
    components: (raw.components ?? []).map((comp: any) => ({
      componentId: comp.componentId,
      name: comp.name,
      quantity: Number(comp.quantity),
      unit: comp.unit,
      dayLabel: comp.dayLabel ?? null,
      productId: comp.productId ?? null,
      productName: comp.productName ?? null,
      selections: (comp.selections ?? []).map((s: any) => ({
        groupId: s.groupId,
        groupName: s.groupName,
        optionId: s.optionId,
        optionName: s.optionName,
        productId: s.productId ?? null,
        productName: s.productName ?? null,
        cutOptionId: s.cutOptionId ?? null,
        cutOptionName: s.cutOptionName ?? null,
      })),
    })),
  };
}

// Los errores del servidor llegan como "CODIGO|mensaje"
export function parseComboError(err: unknown): { code: string; message: string } {
  const msg = err instanceof Error ? err.message : String(err);
  const match = msg.match(/^([A-Z0-9_]+)\|([\s\S]*)$/m);
  if (match) return { code: match[1], message: match[2].trim() };
  return { code: 'ERROR', message: msg };
}

const comboSchema = `*,
  components:combo_components(
    *,
    fixedProduct:fixedProductId(name),
    groups:combo_selection_groups(
      *,
      options:combo_options!combo_options_selection_group_fk(*, product:productId(name,isAvailable), cutOption:cutOptionId(name))
    )
  )`;

export const combosApi = {
  list: async (): Promise<Combo[]> => {
    const { data, error } = await supabase
      .from('combos')
      .select(comboSchema)
      .order('sortOrder', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapCombo);
  },

  listFeatured: async (): Promise<Combo[]> => {
    const { data, error } = await supabase
      .from('combos')
      .select(comboSchema)
      .eq('isFeatured', true)
      .eq('isActive', true)
      .order('sortOrder', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapCombo);
  },

  getBySlug: async (slug: string): Promise<Combo | null> => {
    const { data, error } = await supabase.rpc('get_combo', { p_slug: slug });
    if (error) throw error;
    if (!data) return null;
    return mapCombo(data);
  },

  resolve: async (comboId: number, options: ComboSelectionPayload): Promise<ComboSnapshot> => {
    const { data, error } = await supabase.rpc('resolve_combo', {
      p_combo_id: comboId,
      p_options: options,
    });
    if (error) throw error;
    return mapSnapshot(data);
  },

  save: async (payload: any): Promise<Combo> => {
    const { data, error } = await supabase.rpc('save_combo', { p_payload: payload });
    if (error) throw error;
    return mapCombo(data);
  },

  updateVisibility: async (id: number, patch: { isActive?: boolean; isFeatured?: boolean; sortOrder?: number }) => {
    const { error } = await supabase.from('combos').update(patch).eq('id', id);
    if (error) throw error;
  },

  remove: async (id: number) => {
    const { error } = await supabase.from('combos').delete().eq('id', id);
    if (error) throw error;
  },
};