import React, { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { vlogsService } from '@/services';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Youtube, Calendar, Images, Play, Heart, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AutoSlideshow from '@/components/shared/AutoSlideshow';
import { useHeartReaction } from '@/hooks/useHeartReaction';

function HeartButton({ namespace, id }) {
  const { hearted, count, toggle } = useHeartReaction(namespace, id);
  return (
    <button onClick={toggle}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border
        ${hearted
          ? 'bg-red-50 border-red-200 text-red-500'
          : 'bg-muted/50 border-border text-muted-foreground hover:border-red-200 hover:text-red-400'
        }`}>
      <Heart className={`w-4 h-4 transition-all ${hearted ? 'fill-red-500 text-red-500 scale-110' : ''}`} />
      {count > 0 && <span>{count}</span>}
    </button>
  );
}

function GalleryModal({ photos, onClose }) {
  const [idx, setIdx] = useState(0);
  return (
    <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col items-center justify-center p-4" onClick={onClose}>
      <div className="relative w-full max-w-4xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-0 -top-10 text-white/70 hover:text-white"><X className="w-6 h-6" /></button>
        <img src={photos[idx]} alt="" className="w-full max-h-[75vh] object-contain rounded-lg" />
        {photos.length > 1 && (
          <>
            <button onClick={() => setIdx(i => (i - 1 + photos.length) % photos.length)}
              className="absolute flex items-center justify-center w-10 h-10 text-white -translate-y-1/2 rounded-full left-3 top-1/2 bg-black/60 hover:bg-black/80">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button onClick={() => setIdx(i => (i + 1) % photos.length)}
              className="absolute flex items-center justify-center w-10 h-10 text-white -translate-y-1/2 rounded-full right-3 top-1/2 bg-black/60 hover:bg-black/80">
              <ChevronRight className="w-6 h-6" />
            </button>
            <p className="mt-3 text-sm text-center text-white/60">{idx + 1} / {photos.length}</p>
          </>
        )}
      </div>
    </div>
  );
}

function VlogCard({ vlog, index, onClick }) {
  const allPhotos = [
    ...(vlog.thumbnail ? [vlog.thumbnail] : []),
    ...(vlog.photos || []).filter(p => p !== vlog.thumbnail),
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ delay: index * 0.06 }} className="group">
      <div className="overflow-hidden transition-all duration-500 border bg-card rounded-2xl border-border hover:shadow-xl hover:border-primary/20">
        <div className="relative cursor-pointer h-52" onClick={() => onClick(vlog)}>
          {allPhotos.length > 0 ? (
            <AutoSlideshow photos={allPhotos} className="w-full h-full" />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10">
              <Play className="w-10 h-10 text-primary/40" />
            </div>
          )}
          <div className="absolute inset-0 z-10 flex items-center justify-center transition-colors duration-300 bg-foreground/0 group-hover:bg-foreground/10">
            <div className="flex items-center justify-center w-12 h-12 transition-opacity rounded-full shadow-lg opacity-0 bg-primary/90 group-hover:opacity-100">
              <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
            </div>
          </div>
          {vlog.category && <Badge className="absolute z-20 capitalize border-0 top-3 left-3 bg-secondary/90 text-secondary-foreground">{vlog.category}</Badge>}
          {allPhotos.length > 1 && (
            <div className="absolute z-20 flex items-center gap-1 px-2 py-1 text-xs rounded-full top-3 right-3 bg-foreground/60 text-background">
              <Images className="w-3 h-3" /> {allPhotos.length}
            </div>
          )}
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>{vlog.date ? format(new Date(vlog.date), 'MMMM d, yyyy') : ''}</span>
          </div>
          <h3 className="mb-2 text-lg font-bold cursor-pointer font-heading text-foreground group-hover:text-primary line-clamp-2"
            onClick={() => onClick(vlog)}>{vlog.title}</h3>
          {vlog.description && <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{vlog.description}</p>}
          <HeartButton namespace="vlog" id={vlog.id} />
        </div>
      </div>
    </motion.div>
  );
}

function VlogModal({ vlog, onClose }) {
  const [galleryOpen, setGalleryOpen] = useState(false);
  if (!vlog) return null;
  const allPhotos = [...(vlog.thumbnail ? [vlog.thumbnail] : []), ...(vlog.photos || []).filter(p => p !== vlog.thumbnail)];
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <button onClick={onClose} className="absolute z-10 flex items-center justify-center w-8 h-8 transition rounded-full top-3 right-3 bg-muted hover:bg-muted/80">
            <X className="w-4 h-4" />
          </button>
          {allPhotos.length > 0 && (
            <div className="relative h-64 overflow-hidden cursor-pointer rounded-t-2xl" onClick={() => setGalleryOpen(true)}>
              <AutoSlideshow photos={allPhotos} className="w-full h-full" />
              {allPhotos.length > 1 && (
                <div className="absolute z-10 flex items-center gap-1 px-2 py-1 text-xs text-white rounded-full top-3 right-3 bg-black/60">
                  <Images className="w-3 h-3" /> {allPhotos.length} photos
                </div>
              )}
            </div>
          )}
          <div className="p-6 space-y-4">
            <h2 className="text-2xl font-bold font-heading">{vlog.title}</h2>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {vlog.date && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {format(new Date(vlog.date), 'MMMM d, yyyy')}</span>}
              {vlog.category && <Badge className="capitalize">{vlog.category}</Badge>}
              <HeartButton namespace="vlog" id={vlog.id} />
            </div>
            {vlog.description && <p className="leading-relaxed text-muted-foreground">{vlog.description}</p>}
            {vlog.youtube_url && (
              <Button asChild className="w-full gap-2">
                <a href={vlog.youtube_url} target="_blank" rel="noopener noreferrer">
                  <Youtube className="w-4 h-4" /> Watch on YouTube
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
      {galleryOpen && <GalleryModal photos={allPhotos} onClose={() => setGalleryOpen(false)} />}
    </>
  );
}

const CATEGORIES = ['all', 'ministry', 'testimony', 'worship', 'outreach', 'fellowship', 'general'];

export default function Vlogs() {
  const [category, setCategory] = useState('all');
  const [selected, setSelected] = useState(null);

  const { data: vlogs = [], isLoading } = useQuery({
    queryKey: ['vlogs'],
    queryFn: () => vlogsService.list(),
  });

  const filtered = category === 'all' ? vlogs : vlogs.filter(v => v.category === category);

  return (
    <div className="min-h-screen px-6 pb-24 pt-28">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="mb-2 text-xs font-semibold tracking-widest uppercase text-primary">Church Media</p>
          <h1 className="mb-4 text-4xl font-bold font-heading sm:text-5xl text-foreground">Vlogs</h1>
          <p className="max-w-2xl text-lg text-muted-foreground">Stories, testimonies, and moments from our church family — captured and shared for God's glory.</p>
        </motion.div>

        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`capitalize px-4 py-1.5 rounded-full text-sm font-medium transition-all ${category === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="overflow-hidden border bg-card border-border rounded-2xl">
                <Skeleton className="w-full h-52" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="w-3/4 h-6" />
                  <Skeleton className="w-full h-4" />
                  <Skeleton className="w-5/6 h-4" />
                  <Skeleton className="w-24 h-8 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Play className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-xl font-heading text-muted-foreground">No vlogs yet</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((vlog, i) => <VlogCard key={vlog.id} vlog={vlog} index={i} onClick={setSelected} />)}
          </div>
        )}
      </div>
      <VlogModal vlog={selected} onClose={() => setSelected(null)} />
    </div>
  );
}