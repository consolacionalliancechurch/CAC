import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Search, BookOpen, Play, FileText, Calendar, User, X, Heart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useHeartReaction } from '@/hooks/useHeartReaction';

async function fetchSermons() {
  const { data, error } = await supabase
    .from('sunday_services')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return data;
}

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: false }; }
  static getDerivedStateFromError() { return { error: true }; }
  render() { return this.state.error ? (this.props.fallback || null) : this.props.children; }
}

function HeartButton({ id }) {
  const { hearted, count, toggle } = useHeartReaction('sermon', id);
  return (
    <button onClick={toggle}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border
        ${hearted ? 'bg-red-50 border-red-200 text-red-500' : 'bg-muted/50 border-border text-muted-foreground hover:border-red-200 hover:text-red-400'}`}>
      <Heart className={`w-4 h-4 transition-all ${hearted ? 'fill-red-500 text-red-500 scale-110' : ''}`} />
      {count > 0 && <span>{count}</span>}
    </button>
  );
}

/* ── Detail Modal ── */
function SermonModal({ sermon, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <button onClick={onClose}
          className="absolute z-10 flex items-center justify-center w-8 h-8 transition rounded-full top-4 right-4 bg-muted hover:bg-muted/80">
          <X className="w-4 h-4" />
        </button>

        {/* Cover image — sermon-specific photo only, independent from the homepage speaker photo */}
        {sermon.sermon_thumbnail && (
          <div className="relative w-full overflow-hidden rounded-t-2xl bg-muted">
            <img src={sermon.sermon_thumbnail} alt={sermon.topic_title}
              className="object-contain w-full max-h-[500px] mx-auto"
              style={{
                objectPosition: sermon.sermon_thumbnail_crop
                  ? `${sermon.sermon_thumbnail_crop.x ?? 50}% ${sermon.sermon_thumbnail_crop.y ?? 50}%`
                  : 'center'
              }} />
          </div>
        )}

        <div className="p-7">
          <h2 className="pr-8 mb-3 text-2xl font-bold font-heading text-foreground">
            {sermon.topic_title || 'Untitled Sermon'}
          </h2>

          <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-muted-foreground">
            {sermon.date && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {format(new Date(sermon.date), 'MMMM d, yyyy')}
              </span>
            )}
            {sermon.speaker_name && (
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {sermon.speaker_name}
              </span>
            )}
            {sermon.scripture_reference && (
              <span className="flex items-center gap-1.5 text-primary font-medium">
                <BookOpen className="w-4 h-4" />
                {sermon.scripture_reference}
              </span>
            )}
          </div>

          {sermon.topic_description && (
            <p className="mb-6 leading-relaxed text-muted-foreground">{sermon.topic_description}</p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            {sermon.video_url && (
              <a href={sermon.video_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition">
                <Play className="w-4 h-4" /> Watch on YouTube/FB
              </a>
            )}
            {sermon.slides_pdf && (
              <a href={sermon.slides_pdf} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition">
                <FileText className="w-4 h-4" /> Download Slides (PDF)
              </a>
            )}
            <ErrorBoundary>
              <HeartButton id={sermon.id} />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sermon Card ── */
function SermonCard({ sermon, onClick }) {
  return (
    <div onClick={onClick}
      className="overflow-hidden transition-all border bg-card border-border rounded-2xl hover:shadow-lg hover:-translate-y-0.5 cursor-pointer">

      {/* Sermon photo (independent from homepage speaker photo) or placeholder */}
      <div className="relative flex items-center justify-center w-full overflow-hidden aspect-[1890/2048] bg-muted">
        {sermon.sermon_thumbnail ? (
          <img src={sermon.sermon_thumbnail} alt={sermon.topic_title} className="object-cover w-full h-full"
            style={{
              objectPosition: sermon.sermon_thumbnail_crop
                ? `${sermon.sermon_thumbnail_crop.x ?? 50}% ${sermon.sermon_thumbnail_crop.y ?? 50}%`
                : 'center'
            }} />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
            <BookOpen className="w-10 h-10" />
            {sermon.scripture_reference && (
              <span className="text-xs font-medium text-primary/60">{sermon.scripture_reference}</span>
            )}
          </div>
        )}
        {/* Overlay gradient */}
        {sermon.sermon_thumbnail && <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />}
        {/* Video badge */}
        {sermon.video_url && (
          <div className="absolute flex items-center justify-center w-8 h-8 rounded-full shadow top-3 right-3 bg-primary/90">
            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
          </div>
        )}
        {/* PDF badge */}
        {sermon.slides_pdf && (
          <div className="absolute flex items-center justify-center w-8 h-8 rounded-full shadow top-3 left-3 bg-red-500/90">
            <FileText className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
          {sermon.date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(sermon.date), 'MMM d, yyyy')}
            </span>
          )}
        </div>

        <h3 className="mb-1 text-lg font-bold leading-snug font-heading text-foreground">
          {sermon.topic_title || 'Untitled Sermon'}
        </h3>

        {sermon.scripture_reference && (
          <p className="flex items-center gap-1.5 text-xs text-primary mb-1">
            <BookOpen className="w-3 h-3" /> {sermon.scripture_reference}
          </p>
        )}
        {sermon.speaker_name && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
            <User className="w-3 h-3" /> {sermon.speaker_name}
          </p>
        )}

        {sermon.topic_description && (
          <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{sermon.topic_description}</p>
        )}

        <div className="flex flex-wrap items-center gap-2" onClick={e => e.stopPropagation()}>
          {sermon.video_url && (
            <span className="flex items-center gap-1 text-xs text-primary">
              <Play className="w-3 h-3" /> Video
            </span>
          )}
          {sermon.slides_pdf && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <FileText className="w-3 h-3" /> Slides PDF
            </span>
          )}
          <ErrorBoundary>
            <HeartButton id={sermon.id} />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

export default function SermonArchive() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const { data: sermons = [], isLoading } = useQuery({
    queryKey: ['sermons'],
    queryFn: fetchSermons,
  });

  const filtered = sermons.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.topic_title?.toLowerCase().includes(q) ||
      s.speaker_name?.toLowerCase().includes(q) ||
      s.scripture_reference?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen px-4 pt-24 pb-16 sm:px-6">
      <div className="max-w-6xl mx-auto">

        <div className="mb-10">
          <p className="mb-2 text-sm font-medium tracking-widest uppercase text-primary">The Word</p>
          <h1 className="mb-4 text-4xl font-bold font-heading sm:text-5xl text-foreground">Sermon Archive</h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Revisit past messages and dive deeper into God's Word. Every sermon is a gift — listen, learn, and grow.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search by title, speaker, or verse..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>

        {!isLoading && (
          <p className="mb-6 text-sm text-muted-foreground">
            {filtered.length} sermon{filtered.length !== 1 ? 's' : ''} found
          </p>
        )}

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="overflow-hidden border bg-card border-border rounded-2xl">
                <Skeleton className="w-full aspect-[1890/2048]" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="w-3/4 h-6" />
                  <Skeleton className="w-1/2 h-4" />
                  <Skeleton className="w-2/3 h-4" />
                  <Skeleton className="w-24 h-8 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="font-medium text-muted-foreground">No sermons found</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(sermon => (
              <SermonCard key={sermon.id} sermon={sermon} onClick={() => setSelected(sermon)} />
            ))}
          </div>
        )}
      </div>

      {selected && (
        <ErrorBoundary>
          <SermonModal sermon={selected} onClose={() => setSelected(null)} />
        </ErrorBoundary>
      )}
    </div>
  );
}