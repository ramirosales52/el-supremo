import { supabase } from '../utils/supabase';
import type { CutOption } from '../types';

export const cutOptionsApi = {
  getAll: async () => {
    const { data, error } = await supabase.from('cut_options').select('*').order('id');
    if (error) throw error;
    return (data ?? []) as CutOption[];
  },

  getById: async (id: number) => {
    const { data, error } = await supabase.from('cut_options').select('*').eq('id', id).single();
    if (error) throw error;
    return data as CutOption;
  },

  create: async (input: Partial<CutOption>) => {
    const { data, error } = await supabase.from('cut_options').insert(input).select().single();
    if (error) throw error;
    return data as CutOption;
  },

  update: async (id: number, input: Partial<CutOption>) => {
    const { error } = await supabase.from('cut_options').update(input).eq('id', id);
    if (error) throw error;
    return cutOptionsApi.getById(id);
  },

  delete: async (id: number) => {
    const { error } = await supabase.from('cut_options').delete().eq('id', id);
    if (error) throw error;
  },
};
