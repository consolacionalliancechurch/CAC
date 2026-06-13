import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sermonsService } from '@/services';
import { format } from 'date-fns';
import { Search, BookOpen, Play, FileText, Calendar, User, Tag, X, Heart } from 'lucide-react';
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

/* ── Sermon Detail Modal ── */
function SermonModal({ sermon, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const tags = Array.isArray(sermon.tags) ? sermon.tags : (sermon.tags ? sermon.tags.split(',').map(t => t.trim()) : []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={onClose}
          className="absolute z-10 flex items-center justify-center w-8 h-8 transition rounded-full top-4 right-4 bg-muted hover:bg-muted/80">
          <X className="w-4 h-4" />
        </button>

        <div className="p-7">
          {/* Title */}
          <h2 className="pr-8 mb-3 text-2xl font-bold font-heading text-foreground">{sermon.title}</h2>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground mb-4">
            {sermon.date && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {format(new Date(sermon.date), 'MMMM d, yyyy')}
              </span>
            )}
            {sermon.speaker_name && (
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                {sermon.speaker_name}
              </span>
            )}
            {sermon.scripture_reference && (
              <span className="flex items-center gap-1.5 text-primary font-medium">
                <BookOpen className="w-3.5 h-3.5" />
                {sermon.scripture_reference}
              </span>
            )}
          </div>

          {/* Series badge */}
          {sermon.series && (
            <span className="inline-block px-3 py-1 mb-4 text-xs font-medium rounded-full bg-primary/10 text-primary">
              {sermon.series}
            </span>
          )}

          {/* Description */}
          {sermon.description && (
            <p className="mb-5 leading-relaxed text-muted-foreground">{sermon.description}</p>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {tags.map((tag, i) => (
                <span key={i} className="flex items-center gap-1 text-xs border border-border text-muted-foreground px-2.5 py-1 rounded-full">
                  <Tag className="w-3 h-3" /> {tag}
                </span>
              ))}
            </div>
          )}

          {/* Action buttons */}
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
            <HeartButton namespace="sermon" id={sermon.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sermon Card ── */
function SermonCard({ sermon, onClick }) {
  const hasVideo = !!sermon.video_url;

  return (
    <div
      onClick={onClick}
      className="overflow-hidden transition-all border bg-card border-border rounded-2xl hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
    >
      {/* Thumbnail / placeholder */}
      <div className="relative flex items-center justify-center w-full overflow-hidden h-44 bg-muted">
        {sermon.thumbnail ? (
          <img src={sermon.thumbnail} alt={sermon.title} className="object-cover w-full h-full" />
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground/40">
            <BookOpen className="w-10 h-10" />
            {sermon.scripture_reference && (
              <span className="text-xs font-medium text-primary/60">{sermon.scripture_reference}</span>
            )}
          </div>
        )}
        {/* Series badge overlay */}
        {sermon.series && (
          <span className="absolute top-3 left-3 text-xs bg-black/60 text-white px-2.5 py-1 rounded-full font-medium backdrop-blur-sm">
            {sermon.series}
          </span>
        )}
        {/* Video play icon */}
        {hasVideo && (
          <div className="absolute flex items-center justify-center rounded-full shadow-lg top-3 right-3 w-9 h-9 bg-primary/90">
            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
          {sermon.date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(sermon.date), 'MMM d, yyyy')}
            </span>
          )}
        </div>

        <h3 className="mb-1 text-lg font-bold leading-snug font-heading text-foreground">{sermon.title}</h3>

        {sermon.scripture_reference && (
          <p className="flex items-center gap-1.5 text-xs text-primary mb-1">
            <BookOpen className="w-3 h-3" /> {sermon.scripture_reference}
          </p>
        )}
        {sermon.speaker_name && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <User className="w-3 h-3" /> {sermon.speaker_name}
          </p>
        )}

        {sermon.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{sermon.description}</p>
        )}

        {/* Footer indicators */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
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
          <HeartButton namespace="sermon" id={sermon.id} />
        </div>
      </div>
    </div>
  );
}

/* ── Main page ── */
export default function SermonArchive() {
  const [search, setSearch] = useState('');
  const [activeSeries, setActiveSeries] = useState('All Series');
  const [selected, setSelected] = useState(null);

  const { data: sermons = [], isLoading } = useQuery({
    queryKey: ['sermons'],
    queryFn: () => sermonsService.list(),
  });

  // Build unique series list
  const seriesList = ['All Series', ...Array.from(new Set(sermons.map(s => s.series).filter(Boolean)))];

  const filtered = sermons.filter(s => {
    const matchSearch =
      s.title?.toLowerCase().includes(search.toLowerCase()) ||
      s.speaker_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.scripture_reference?.toLowerCase().includes(search.toLowerCase()) ||
      s.series?.toLowerCase().includes(search.toLowerCase());
    const matchSeries = activeSeries === 'All Series' || s.series === activeSeries;
    return matchSearch && matchSeries;
  });

  return (
    <div className="min-h-screen px-4 pt-24 pb-16 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <p className="mb-2 text-sm font-medium tracking-widest uppercase text-primary">The Word</p>
          <h1 className="mb-4 text-4xl font-bold font-heading sm:text-5xl text-foreground">Sermon Archive</h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Revisit past messages and dive deeper into God's Word. Every sermon is a gift — listen, learn, and grow.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title, speaker, or verse..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Series filter pills */}
        {seriesList.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {seriesList.map(s => (
              <button key={s} onClick={() => setActiveSeries(s)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                  activeSeries === s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Count */}
        {!isLoading && (
          <p className="mb-6 text-sm text-muted-foreground">
            {filtered.length} sermon{filtered.length !== 1 ? 's' : ''} found
          </p>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 rounded-full border-muted border-t-primary animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="font-medium text-muted-foreground">No sermons found</p>
            <p className="text-sm text-muted-foreground">Try a different search term or filter</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(sermon => (
              <SermonCard key={sermon.id} sermon={sermon} onClick={() => setSelected(sermon)} />
            ))}
          </div>
        )}
      </div>

      {selected && <SermonModal sermon={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}