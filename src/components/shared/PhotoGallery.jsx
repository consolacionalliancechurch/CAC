import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function PhotoGallery({ photos = [], open, onClose }) {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent(i => (i - 1 + photos.length) % photos.length);
  const next = () => setCurrent(i => (i + 1) % photos.length);

  if (!open || !photos.length) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 bg-black border-0 overflow-hidden">
        <div className="relative flex items-center justify-center min-h-[60vh]">
          <img
            src={photos[current]}
            alt=""
            className="max-h-[80vh] max-w-full object-contain"
          />
          {photos.length > 1 && (
            <>
              <button onClick={prev} className="absolute left-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={next} className="absolute right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition">
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
          <div className="absolute bottom-4 text-white/70 text-sm">
            {current + 1} / {photos.length}
          </div>
        </div>
        {photos.length > 1 && (
          <div className="flex gap-2 p-3 bg-black overflow-x-auto">
            {photos.map((p, i) => (
              <img
                key={i}
                src={p}
                alt=""
                onClick={() => setCurrent(i)}
                className={`h-14 w-20 object-cover rounded cursor-pointer shrink-0 transition ${i === current ? 'ring-2 ring-white' : 'opacity-60 hover:opacity-100'}`}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}