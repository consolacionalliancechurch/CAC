import { supabase } from '@/lib/supabaseClient';

// Only columns that exist in the sermons table
const ALLOWED = [
  'title', 'date', 'speaker_name', 'speaker_photo',
  'scripture_reference', 'series', 'description',
  'thumbnail', 'video_url', 'audio_url', 'slides_pdf', 'tags',
];

function sanitize(fields) {
  const clean = Object.fromEntries(
    Object.entries(fields).filter(([k]) => ALLOWED.includes(k))
  );
  // tags column is text[] in Supabase — convert "faith, hope, love" → ["faith","hope","love"]
  if ('tags' in clean) {
    if (typeof clean.tags === 'string') {
      clean.tags = clean.tags
        ? clean.tags.split(',').map(t => t.trim()).filter(Boolean)
        : [];
    }
    if (!Array.isArray(clean.tags)) clean.tags = [];
  }
  return clean;
}

// Convert tags array back to comma string for the form input
function toFormShape(row) {
  if (!row) return row;
  return {
    ...row,
    tags: Array.isArray(row.tags) ? row.tags.join(', ') : (row.tags || ''),
  };
}

export const sermonsService = {
  async list() {
    const { data, error } = await supabase
      .from('sermons')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    return data.map(toFormShape);
  },

  async create(fields) {
    const { data, error } = await supabase
      .from('sermons')
      .insert(sanitize(fields))
      .select()
      .single();
    if (error) throw error;
    return toFormShape(data);
  },

  async update(id, fields) {
    const { data, error } = await supabase
      .from('sermons')
      .update(sanitize(fields))
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return toFormShape(data);
  },

  async remove(id) {
    const { error } = await supabase
      .from('sermons')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};