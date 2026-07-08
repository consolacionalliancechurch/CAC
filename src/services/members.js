import { supabase } from '@/lib/supabaseClient';

// Only columns that exist in the members table
const ALLOWED = [
  'full_name', 'gender', 'contact_number', 'member_type', 'status',
  'birth_month', 'birth_day', 'birth_year',
  'anniversary_month', 'anniversary_day', 'anniversary_year',
];

function sanitize(fields) {
  return Object.fromEntries(
    Object.entries(fields).filter(([k]) => ALLOWED.includes(k))
  );
}

export const membersService = {
  async list() {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('full_name', { ascending: true });
    if (error) throw error;
    return data;
  },

  async create(fields) {
    const { data, error } = await supabase
      .from('members')
      .insert(sanitize(fields))
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, fields) {
    const { data, error } = await supabase
      .from('members')
      .update(sanitize(fields))
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};