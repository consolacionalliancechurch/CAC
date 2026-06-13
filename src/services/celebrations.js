import { supabase } from '@/lib/supabaseClient';

// Only columns that exist in the celebrations table
const ALLOWED = ['member_name', 'type', 'date', 'photo', 'photo_crop', 'message'];

function sanitize(fields) {
  return Object.fromEntries(
    Object.entries(fields).filter(([k]) => ALLOWED.includes(k))
  );
}

export const celebrationsService = {
  async list() {
    const { data, error } = await supabase
      .from('celebrations')
      .select('*')
      .order('date', { ascending: true });
    if (error) throw error;
    return data;
  },

  async getThisMonth() {
    const currentMonth = new Date().getMonth() + 1;
    const { data, error } = await supabase
      .from('celebrations')
      .select('*')
      .eq('month', currentMonth)
      .order('day', { ascending: true });
    if (error) throw error;
    return data;
  },

  async create(fields) {
    const { data, error } = await supabase
      .from('celebrations')
      .insert(sanitize(fields))
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, fields) {
    const { data, error } = await supabase
      .from('celebrations')
      .update(sanitize(fields))
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    const { error } = await supabase
      .from('celebrations')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};