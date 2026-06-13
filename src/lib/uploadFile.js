import { supabase } from '@/lib/supabaseClient';

export async function uploadFile(file, folder = 'general') {
  const ext = file.name.split('.').pop();
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from('church-media')
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from('church-media')
    .getPublicUrl(filename);

  return data.publicUrl;
}