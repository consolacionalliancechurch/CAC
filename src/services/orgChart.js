import { supabase } from '@/lib/supabaseClient';

const ALLOWED = ['name', 'role', 'photo', 'photo_crop', 'parent_id', 'sort_order'];

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

export const orgChartService = {
  // Fetch the entire tree flat — building the nested structure happens client-side
  async list() {
    const { data, error } = await supabase
      .from('org_chart')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data || []).map(parseRow);
  },

  async create(fields) {
    const { data, error } = await supabase
      .from('org_chart')
      .insert(sanitize(fields))
      .select()
      .single();
    if (error) throw error;
    return parseRow(data);
  },

  async update(id, fields) {
    const { data, error } = await supabase
      .from('org_chart')
      .update(sanitize(fields))
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return parseRow(data);
  },

  // Delete only this node — children become root-level (parent_id = null)
  async removeOnly(id) {
    const { error: detachError } = await supabase
      .from('org_chart')
      .update({ parent_id: null })
      .eq('parent_id', id);
    if (detachError) throw detachError;

    const { error } = await supabase.from('org_chart').delete().eq('id', id);
    if (error) throw error;
  },

  // Delete this node and every descendant
  async removeWithDescendants(id) {
    // Fetch full tree to compute descendant ids client-side
    const all = await this.list();
    const toDelete = new Set([id]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const row of all) {
        if (row.parent_id && toDelete.has(row.parent_id) && !toDelete.has(row.id)) {
          toDelete.add(row.id);
          changed = true;
        }
      }
    }
    const { error } = await supabase.from('org_chart').delete().in('id', Array.from(toDelete));
    if (error) throw error;
  },

  // Delete this node, reassigning its direct children to a new parent
  async removeAndReassign(id, newParentId) {
    const { error: reassignError } = await supabase
      .from('org_chart')
      .update({ parent_id: newParentId || null })
      .eq('parent_id', id);
    if (reassignError) throw reassignError;

    const { error } = await supabase.from('org_chart').delete().eq('id', id);
    if (error) throw error;
  },

  // Move a node under a different parent (for drag-and-drop)
  async reparent(id, newParentId, newSortOrder = 0) {
    const { data, error } = await supabase
      .from('org_chart')
      .update({ parent_id: newParentId || null, sort_order: newSortOrder })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return parseRow(data);
  },

  async reorder(updates) {
    // updates: [{ id, sort_order }]
    const results = await Promise.all(
      updates.map(({ id, sort_order }) =>
        supabase.from('org_chart').update({ sort_order }).eq('id', id)
      )
    );
    const failed = results.find(r => r.error);
    if (failed) throw failed.error;
  },
};