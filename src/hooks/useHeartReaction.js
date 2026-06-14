import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

function getDeviceId() {
  try {
    let id = localStorage.getItem('cac_device_id');
    if (!id) {
      // Safe UUID generation that works in all browsers
      id = 'dev_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11);
      localStorage.setItem('cac_device_id', id);
    }
    return id;
  } catch {
    return 'dev_' + Math.random().toString(36).slice(2, 11);
  }
}

export function useHeartReaction(namespace, id) {
  const [hearted, setHearted] = useState(false);
  const [count, setCount] = useState(0);

  const deviceId = getDeviceId();
  const key = `${namespace}_${id}`;

  useEffect(() => {
    if (!namespace || !id) return;

    let cancelled = false;

    const load = async () => {
      try {
        const { count: total } = await supabase
          .from('reactions')
          .select('*', { count: 'exact', head: true })
          .eq('target_key', key);

        const { data: mine } = await supabase
          .from('reactions')
          .select('id')
          .eq('target_key', key)
          .eq('device_id', deviceId)
          .maybeSingle();

        if (!cancelled) {
          setCount(total || 0);
          setHearted(!!mine);
        }
      } catch (err) {
        console.error('Heart load error:', err);
      }
    };

    load();

    // Realtime subscription
    let channel;
    try {
      channel = supabase
        .channel(`reactions-${key}-${Math.random()}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'reactions',
          filter: `target_key=eq.${key}`,
        }, () => { if (!cancelled) load(); })
        .subscribe();
    } catch (err) {
      console.error('Realtime subscribe error:', err);
    }

    return () => {
      cancelled = true;
      if (channel) {
        try { supabase.removeChannel(channel); } catch {}
      }
    };
  }, [namespace, id, key, deviceId]);

  const toggle = useCallback(async (e) => {
    if (e?.stopPropagation) e.stopPropagation();
    try {
      if (hearted) {
        setHearted(false);
        setCount(c => Math.max(0, c - 1));
        await supabase
          .from('reactions')
          .delete()
          .eq('target_key', key)
          .eq('device_id', deviceId);
      } else {
        setHearted(true);
        setCount(c => c + 1);
        await supabase
          .from('reactions')
          .insert({ target_key: key, device_id: deviceId });
      }
    } catch (err) {
      console.error('Heart toggle error:', err);
    }
  }, [hearted, key, deviceId]);

  return { hearted, count, toggle };
}