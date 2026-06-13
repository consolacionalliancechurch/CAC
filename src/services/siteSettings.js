import { supabase } from '@/lib/supabaseClient';

export const siteSettingsService = {
  async get(key) {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', key)
      .single();
    if (error) return null;
    return data?.value;
  },

  async set(key, value) {
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key, value }, { onConflict: 'key' });
    if (error) throw error;
  },

  async getMany(keys) {
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', keys);
    if (error) return {};
    return Object.fromEntries((data || []).map(r => [r.key, r.value]));
  },
};