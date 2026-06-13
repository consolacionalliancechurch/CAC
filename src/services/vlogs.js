import { supabase } from '@/lib/supabaseClient';

export const vlogsService = {
  async list() {
    const { data, error } = await supabase
      .from('vlogs')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(fields) {
    const { data, error } = await supabase
      .from('vlogs')
      .insert(fields)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, fields) {
    const { data, error } = await supabase
      .from('vlogs')
      .update(fields)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    const { error } = await supabase
      .from('vlogs')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};