import { supabase } from '@/lib/supabaseClient';

const ALLOWED = ['name', 'role', 'photo', 'photo_crop', 'bio', 'verse', 'sort_order'];

function sanitize(fields) {
  const clean = Object.fromEntries(Object.entries(fields).filter(([k]) => ALLOWED.includes(k)));
  if ('photo_crop' in clean && clean.photo_crop && typeof clean.photo_crop !== 'string') {
    clean.photo_crop = JSON.stringify(clean.photo_crop);
  }
  return clean;
}

function parseRow(row) {
  if (!row) return row;
  let photo_crop = row.photo_crop;
  if (typeof photo_crop === 'string') {
    try { photo_crop = JSON.parse(photo_crop); } catch { photo_crop = null; }
  }
  return { ...row, photo_crop };
}

export const pastorsService = {
  async list() {
    const { data, error } = await supabase
      .from('pastors')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data || []).map(parseRow);
  },
  async create(fields) {
    const { data, error } = await supabase.from('pastors').insert(sanitize(fields)).select().single();
    if (error) throw error;
    return parseRow(data);
  },
  async update(id, fields) {
    const { data, error } = await supabase.from('pastors').update(sanitize(fields)).eq('id', id).select().single();
    if (error) throw error;
    return parseRow(data);
  },
  async remove(id) {
    const { error } = await supabase.from('pastors').delete().eq('id', id);
    if (error) throw error;
  },
};