import { useState, useEffect } from 'react';

// Stores hearts in localStorage keyed by "hearts_<namespace>_<id>"
export function useHeartReaction(namespace, id) {
  const key = `hearts_${namespace}_${id}`;
  const countKey = `hearts_count_${namespace}_${id}`;

  const [hearted, setHearted] = useState(() => {
    try { return localStorage.getItem(key) === '1'; } catch { return false; }
  });
  const [count, setCount] = useState(() => {
    try { return parseInt(localStorage.getItem(countKey) || '0'); } catch { return 0; }
  });

  const toggle = (e) => {
    e.stopPropagation();
    const next = !hearted;
    const nextCount = next ? count + 1 : Math.max(0, count - 1);
    setHearted(next);
    setCount(nextCount);
    try {
      localStorage.setItem(key, next ? '1' : '0');
      localStorage.setItem(countKey, String(nextCount));
    } catch {}
  };

  return { hearted, count, toggle };
}