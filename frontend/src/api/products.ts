import { supabase } from '../utils/supabase';
import type { Product, CutOption } from '../types';

function mapProduct(raw: any): Product {
  const cutOptions: CutOption[] = (raw.products_cut_options ?? [])
    .map((pco: any) => pco.cutOption)
    .filter(Boolean);
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description || undefined,
    basePrice: raw.basePrice,
    unit: raw.unit,
    images: raw.images ?? (raw.image ? [raw.image] : undefined),
    isAvailable: raw.isAvailable,
    isOnSale: raw.isOnSale ?? false,
    discountPercentage: raw.discountPercentage ?? null,
    category: raw.category ?? raw.categoryId,
    categoryId: raw.categoryId,
    cutOptions,
  };
}

export const productsApi = {
  getAll: async (
    categoryId?: number,
    search?: string,
    page: number = 1,
    pageSize: number = 15
  ) => {
    let query = supabase
      .from('products')
      .select('*, category:categoryId(*), products_cut_options(cutOption:cutOptionId(*))', { count: 'exact' })
      .eq('isAvailable', true);
    if (categoryId) query = query.eq('categoryId', categoryId);
    if (search) {
      const normalized = search.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      query = query.or(
        `name.ilike.%${normalized}%,description.ilike.%${normalized}%,` +
        `product_search_text.ilike.%${normalized}%`
      );
    }
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data, error, count } = await query.order('id').range(from, to);
    if (error) throw error;
    return { products: (data ?? []).map(mapProduct), count: count ?? 0 };
  },

  search: async (query: string) => {
    return productsApi.getAll(undefined, query);
  },

  getAllAdmin: async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categoryId(*), products_cut_options(cutOption:cutOptionId(*))')
      .order('id');
    if (error) throw error;
    return (data ?? []).map(mapProduct);
  },

  getById: async (id: number) => {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categoryId(*), products_cut_options(cutOption:cutOptionId(*))')
      .eq('id', id)
      .single();
    if (error) throw error;
    return mapProduct(data);
  },

  create: async (productData: any) => {
    const { cutOptionIds, ...fields } = productData;
    const { data, error } = await supabase
      .from('products')
      .insert(fields)
      .select()
      .single();
    if (error) throw error;

    if (cutOptionIds?.length) {
      const joins = cutOptionIds.map((cutOptionId: number) => ({
        productId: data.id,
        cutOptionId,
      }));
      const { error: joinError } = await supabase
        .from('products_cut_options')
        .insert(joins);
      if (joinError) throw joinError;
    }

    return productsApi.getById(data.id);
  },

  update: async (id: number, productData: any) => {
    const { cutOptionIds, ...fields } = productData;
    const { error } = await supabase
      .from('products')
      .update(fields)
      .eq('id', id);
    if (error) throw error;

    if (cutOptionIds) {
      await supabase.from('products_cut_options').delete().eq('productId', id);
      if (cutOptionIds.length) {
        const joins = cutOptionIds.map((cutOptionId: number) => ({
          productId: id,
          cutOptionId,
        }));
        const { error: joinError } = await supabase
          .from('products_cut_options')
          .insert(joins);
        if (joinError) throw joinError;
      }
    }

    return productsApi.getById(id);
  },

  delete: async (id: number) => {
    await supabase.from('products_cut_options').delete().eq('productId', id);
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },
};
