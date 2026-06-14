import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { activitiesService } from '@/services';
import { format } from 'date-fns';
import { MapPin, Calendar, ChevronLeft, ChevronRight, X, Images, Heart } from 'lucide-react';
import { useHeartReaction } from '@/hooks/useHeartReaction';

const CATEGORIES = ['all', 'youth', 'men', 'women', 'worship', 'outreach', 'missions', 'fellowship', 'general'];

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: false }; }
  static getDerivedStateFromError() { return { error: true }; }
  componentDidCatch(err) { console.error('Component error:', err); }
  render() {
    if (this.state.error) return this.props.fallback || null;
    return this.props.children;
  }
}

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

function getAllImages(activity) {
  return [
    ...(activity.cover_image ? [activity.cover_image] : []),
    ...(Array.isArray(activity.photos) ? activity.photos.filter(i => i !== activity.cover_image) : []),
  ].filter(Boolean);
}

function CardSlideshow({ images, cover }) {
  const all = getAllImages({ cover_image: cover, photos: images });
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (all.length <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % all.length), 5000);
    return () => clearInterval(t);
  }, [all.length]);

  if (!all.length) return (
    <div className="flex items-center justify-center w-full h-52 bg-muted">
      <Images className="w-10 h-10 text-muted-foreground/30" />
    </div>
  );

  return (
    <div className="relative w-full overflow-hidden h-52">
      {all.map((src, i) => (
        <img key={i} src={src} alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === idx ? 'opacity-100' : 'opacity-0'}`} />
      ))}
      {all.length > 1 && (
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
          <Images className="w-3 h-3" /> {all.length} photos
        </div>
      )}
    </div>
  );
}

function ModalSlideshow({ images }) {
  const [idx, setIdx] = useState(0);

  const prev = useCallback((e) => {
    e.stopPropagation();
    setIdx(i => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const next = useCallback((e) => {
    e.stopPropagation();
    setIdx(i => (i + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % images.length), 5000);
    return () => clearInterval(t);
  }, [images.length]);

  if (!images.length) return null;

  return (
    <div className="relative w-full overflow-hidden bg-black h-72 rounded-t-2xl group">
      {images.map((src, i) => (
        <img key={i} src={src} alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === idx ? 'opacity-100' : 'opacity-0'}`} />
      ))}
      {images.length > 1 && (
        <>
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full font-medium z-10">
            <Images className="w-3.5 h-3.5" /> {images.length} photos
          </div>
          <button onClick={prev}
            className="absolute z-10 flex items-center justify-center w-8 h-8 text-white transition -translate-y-1/2 rounded-full opacity-0 left-3 top-1/2 bg-black/50 hover:bg-black/70 group-hover:opacity-100">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={next}
            className="absolute z-10 flex items-center justify-center w-8 h-8 text-white transition -translate-y-1/2 rounded-full opacity-0 right-3 top-1/2 bg-black/50 hover:bg-black/70 group-hover:opacity-100">
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
            {images.map((_, i) => (
              <button key={i} onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                className={`h-1.5 rounded-full transition-all ${i === idx ? 'bg-white w-4' : 'bg-white/50 w-1.5'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function GalleryModal({ images, onClose }) {
  const [idx, setIdx] = useState(0);
  const prev = useCallback(() => setIdx(i => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIdx(i => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [prev, next, onClose]);

  return (
    <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col items-center justify-center p-4" onClick={onClose}>
      <div className="relative w-full max-w-4xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-0 -top-10 text-white/70 hover:text-white">
          <X className="w-6 h-6" />
        </button>
        <img src={images[idx]} alt="" className="w-full max-h-[75vh] object-contain rounded-lg" />
        {images.length > 1 && (
          <>
            <button onClick={prev} className="absolute flex items-center justify-center w-10 h-10 text-white -translate-y-1/2 rounded-full left-3 top-1/2 bg-black/60 hover:bg-black/80">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button onClick={next} className="absolute flex items-center justify-center w-10 h-10 text-white -translate-y-1/2 rounded-full right-3 top-1/2 bg-black/60 hover:bg-black/80">
              <ChevronRight className="w-6 h-6" />
            </button>
            <p className="mt-3 text-sm text-center text-white/60">{idx + 1} / {images.length}</p>
          </>
        )}
        <div className="flex justify-center gap-2 pb-1 mt-3 overflow-x-auto">
          {images.map((src, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition ${i === idx ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'}`}>
              <img src={src} alt="" className="object-cover w-full h-full" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ActivityModal({ activity, onClose }) {
  const [showGallery, setShowGallery] = useState(false);
  const allImages = getAllImages(activity);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}>

          <button onClick={onClose}
            className="absolute z-10 flex items-center justify-center w-8 h-8 text-white transition rounded-full top-3 right-3 bg-black/40 hover:bg-black/60">
            <X className="w-4 h-4" />
          </button>

          {allImages.length > 0 && <ModalSlideshow images={allImages} />}

          <div className="p-6">
            <h2 className="mb-3 text-2xl font-bold font-heading text-foreground">{activity.title}</h2>

            <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-muted-foreground">
              {activity.date && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(activity.date), 'MMMM d, yyyy')}
                </span>
              )}
              {activity.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {activity.location}
                </span>
              )}
              {activity.category && (
                <span className="capitalize text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                  {activity.category}
                </span>
              )}
            </div>

            {activity.description && (
              <p className="mb-5 leading-relaxed text-muted-foreground">{activity.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <ErrorBoundary>
                <HeartButton namespace="activity" id={activity.id} />
              </ErrorBoundary>
              {allImages.length > 0 && (
                <button onClick={() => setShowGallery(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition border rounded-xl border-border hover:bg-muted text-foreground">
                  <Images className="w-4 h-4" />
                  View All {allImages.length} Photo{allImages.length !== 1 ? 's' : ''}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {showGallery && <GalleryModal images={allImages} onClose={() => setShowGallery(false)} />}
    </>
  );
}

export default function Activities() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selected, setSelected] = useState(null);

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: () => activitiesService.list(),
  });

  const filtered = activeCategory === 'all'
    ? activities
    : activities.filter(a => a.category === activeCategory);

  return (
    <div className="min-h-screen px-4 pt-24 pb-16 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <p className="mb-2 text-sm font-medium tracking-widest uppercase text-primary">Community Life</p>
          <h1 className="mb-4 text-4xl font-bold font-heading sm:text-5xl text-foreground">Activities</h1>
          <p className="text-lg text-muted-foreground">Moments of faith, fellowship, and service shared together.</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`capitalize px-4 py-1.5 rounded-full text-sm font-medium transition ${
                activeCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 rounded-full border-muted border-t-primary animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">No activities found.</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(activity => (
              <div key={activity.id} onClick={() => setSelected(activity)}
                className="overflow-hidden transition-all border bg-card border-border rounded-2xl hover:shadow-lg hover:-translate-y-0.5 cursor-pointer">
                <CardSlideshow images={activity.photos} cover={activity.cover_image} />
                <div className="p-5">
                  {activity.category && (
                    <span className="capitalize text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                      {activity.category}
                    </span>
                  )}
                  <h3 className="mt-2 mb-1 text-lg font-bold font-heading">{activity.title}</h3>
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    {activity.date && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(activity.date), 'MMMM d, yyyy')}
                      </span>
                    )}
                    {activity.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {activity.location}
                      </span>
                    )}
                  </div>
                  {activity.description && (
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{activity.description}</p>
                  )}
                  <div className="mt-3" onClick={e => e.stopPropagation()}>
                    <ErrorBoundary>
                      <HeartButton namespace="activity" id={activity.id} />
                    </ErrorBoundary>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <ErrorBoundary fallback={
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setSelected(null)}>
            <div className="w-full max-w-md p-8 text-center bg-background rounded-2xl">
              <h2 className="mb-2 text-xl font-bold font-heading">{selected.title}</h2>
              <p className="mb-4 text-sm text-muted-foreground">{selected.description}</p>
              <button onClick={() => setSelected(null)} className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground">Close</button>
            </div>
          </div>
        }>
          <ActivityModal activity={selected} onClose={() => setSelected(null)} />
        </ErrorBoundary>
      )}
    </div>
  );
}