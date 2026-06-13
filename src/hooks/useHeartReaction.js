import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Gets or creates a persistent anonymous device ID
function getDeviceId() {
  let id = localStorage.getItem('cac_device_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('cac_device_id', id);
  }
  return id;
}

export function useHeartReaction(namespace, id) {
  const [hearted, setHearted] = useState(false);
  const [count, setCount] = useState(0);
  const deviceId = getDeviceId();
  const key = `${namespace}_${id}`;

  // Load count + whether this device has hearted
  useEffect(() => {
    if (!namespace || !id) return;

    const load = async () => {
      // Get total count
      const { count: total } = await supabase
        .from('reactions')
        .select('*', { count: 'exact', head: true })
        .eq('target_key', key);

      // Check if this device already hearted
      const { data: mine } = await supabase
        .from('reactions')
        .select('id')
        .eq('target_key', key)
        .eq('device_id', deviceId)
        .maybeSingle();

      setCount(total || 0);
      setHearted(!!mine);
    };

    load();

    // Realtime subscription so all devices update live
    const channel = supabase
      .channel(`reactions-${key}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'reactions',
        filter: `target_key=eq.${key}`,
      }, () => load())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [namespace, id, key, deviceId]);

  const toggle = useCallback(async (e) => {
    if (e?.stopPropagation) e.stopPropagation();

    if (hearted) {
      // Remove heart
      setHearted(false);
      setCount(c => Math.max(0, c - 1));
      await supabase
        .from('reactions')
        .delete()
        .eq('target_key', key)
        .eq('device_id', deviceId);
    } else {
      // Add heart
      setHearted(true);
      setCount(c => c + 1);
      await supabase
        .from('reactions')
        .insert({ target_key: key, device_id: deviceId });
    }
  }, [hearted, key, deviceId]);

  return { hearted, count, toggle };
}