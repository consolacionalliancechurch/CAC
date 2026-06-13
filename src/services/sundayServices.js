import { supabase } from '@/lib/supabaseClient';

export const sundayServicesService = {
  async list() {
    const { data, error } = await supabase
      .from('sunday_services')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getUpcoming() {
    const { data, error } = await supabase
      .from('sunday_services')
      .select('*')
      .eq('is_upcoming', true)
      .order('date', { ascending: true })
      .limit(1)
      .single();
    // .single() throws if no row found — we handle that gracefully
    if (error && error.code !== 'PGRST116') throw error;
    return data ?? null;
  },

  async create(fields) {
    const { data, error } = await supabase
      .from('sunday_services')
      .insert(fields)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, fields) {
    const { data, error } = await supabase
      .from('sunday_services')
      .update(fields)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    const { error } = await supabase
      .from('sunday_services')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};