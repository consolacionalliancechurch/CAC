import { supabase } from '@/lib/supabaseClient';

export const worshipSchedulesService = {
  async list() {
    const { data, error } = await supabase
      .from('worship_schedules')
      .select('*')
      .order('day_of_week', { ascending: true });
    if (error) throw error;
    return data;
  },

  async listActive() {
    const { data, error } = await supabase
      .from('worship_schedules')
      .select('*')
      .eq('is_active', true)
      .order('day_of_week', { ascending: true });
    if (error) throw error;
    return data;
  },

  async create(fields) {
    const { data, error } = await supabase
      .from('worship_schedules')
      .insert(fields)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, fields) {
    const { data, error } = await supabase
      .from('worship_schedules')
      .update(fields)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    const { error } = await supabase
      .from('worship_schedules')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};