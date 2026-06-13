import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AutoSlideshow({ photos = [], className = '', interval = 5000 }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (photos.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % photos.length);
    }, interval);
    return () => clearInterval(timer);
  }, [photos.length, interval]);

  if (!photos.length) return null;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={photos[current]}
          alt=""
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.6 }}
          className="w-full h-full object-cover absolute inset-0"
        />
      </AnimatePresence>
      {photos.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={e => { e.stopPropagation(); setCurrent(i); }}
              className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? 'bg-white scale-125' : 'bg-white/50'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}