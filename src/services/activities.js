import { supabase } from '@/lib/supabaseClient';

export const activitiesService = {
  async list() {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(fields) {
    const { data, error } = await supabase
      .from('activities')
      .insert(fields)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, fields) {
    const { data, error } = await supabase
      .from('activities')
      .update(fields)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};