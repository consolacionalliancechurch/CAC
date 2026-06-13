import { supabase } from '@/lib/supabaseClient';

const ALLOWED = ['host_name', 'day', 'time', 'location', 'description', 'sort_order'];

function sanitize(fields) {
  return Object.fromEntries(Object.entries(fields).filter(([k]) => ALLOWED.includes(k)));
}

export const cellgroupsService = {
  async list() {
    const { data, error } = await supabase
      .from('cellgroups')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return data;
  },
  async create(fields) {
    const { data, error } = await supabase.from('cellgroups').insert(sanitize(fields)).select().single();
    if (error) throw error;
    return data;
  },
  async update(id, fields) {
    const { data, error } = await supabase.from('cellgroups').update(sanitize(fields)).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  async remove(id) {
    const { error } = await supabase.from('cellgroups').delete().eq('id', id);
    if (error) throw error;
  },
};