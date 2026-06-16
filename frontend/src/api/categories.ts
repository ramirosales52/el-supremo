import { supabase } from '../utils/supabase';
import type { Category } from '../types';

export const categoriesApi = {
  getAll: async () => {
    const { data, error } = await supabase.from('categories').select('*').order('id');
    if (error) throw error;
    return (data ?? []) as Category[];
  },

  getById: async (id: number) => {
    const { data, error } = await supabase.from('categories').select('*').eq('id', id).single();
    if (error) throw error;
    return data as Category;
  },

  create: async (data: Partial<Category>) => {
    const { data: result, error } = await supabase.from('categories').insert(data).select().single();
    if (error) throw error;
    return result as Category;
  },

  update: async (id: number, data: Partial<Category>) => {
    const { error } = await supabase.from('categories').update(data).eq('id', id);
    if (error) throw error;
    return categoriesApi.getById(id);
  },

  delete: async (id: number) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  },
};
