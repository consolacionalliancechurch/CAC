import { supabase } from '@/lib/supabaseClient';

export const prayerRequestsService = {
  async list() {
    const { data, error } = await supabase
      .from('prayer_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Public: no auth needed — matches our RLS policy
  async submit(fields) {
    const { data, error } = await supabase
      .from('prayer_requests')
      .insert(fields)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Admin only: update status (pending → in_agenda → prayed_for)
  async update(id, fields) {
    const { data, error } = await supabase
      .from('prayer_requests')
      .update(fields)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    const { error } = await supabase
      .from('prayer_requests')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};