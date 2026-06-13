import { supabase } from '@/lib/supabaseClient';

const ALLOWED = ['name', 'role', 'photo', 'level', 'sort_order'];

function sanitize(fields) {
  return Object.fromEntries(Object.entries(fields).filter(([k]) => ALLOWED.includes(k)));
}

export const orgChartService = {
  async list() {
    const { data, error } = await supabase
      .from('org_chart')
      .select('*')
      .order('level', { ascending: true })
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return data;
  },
  async create(fields) {
    const { data, error } = await supabase.from('org_chart').insert(sanitize(fields)).select().single();
    if (error) throw error;
    return data;
  },
  async update(id, fields) {
    const { data, error } = await supabase.from('org_chart').update(sanitize(fields)).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  async remove(id) {
    const { error } = await supabase.from('org_chart').delete().eq('id', id);
    if (error) throw error;
  },
};