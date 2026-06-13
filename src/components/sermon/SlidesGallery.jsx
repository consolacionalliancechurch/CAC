import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { FileText, Download, Calendar, User, ExternalLink, Presentation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

function SlideCard({ sermon, index, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07 }}
      className="group cursor-pointer"
      onClick={() => onClick(sermon)}
    >
      <div className="bg-card rounded-xl border border-border hover:border-amber-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
        {/* Preview area */}
        <div className="h-36 bg-gradient-to-br from-amber-50 to-orange-50 flex flex-col items-center justify-center relative border-b border-border group-hover:from-amber-100 group-hover:to-orange-100 transition-colors duration-300">
          <Presentation className="w-10 h-10 text-amber-500 mb-2" />
          <span className="text-xs text-amber-700 font-medium">PDF Slides</span>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-amber-900/10">
            <div className="bg-amber-600 text-white text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5">
              <ExternalLink className="w-3 h-3" /> View Slides
            </div>
          </div>
        </div>
        {/* Info */}
        <div className="p-4">
          <h3 className="font-heading font-bold text-sm text-foreground leading-snug line-clamp-2 mb-2 group-hover:text-amber-700 transition-colors">
            {sermon.title}
          </h3>
          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" /> {sermon.speaker_name}
            </span>
            {sermon.date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {format(new Date(sermon.date), 'MMM d, yyyy')}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SlidesModal({ sermon, onClose }) {
  if (!sermon) return null;
  return (
    <Dialog open={!!sermon} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl pr-8 leading-snug">{sermon.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {sermon.speaker_name}</span>
            {sermon.date && (
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {format(new Date(sermon.date), 'MMMM d, yyyy')}</span>
            )}
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex flex-col items-center gap-4">
            <Presentation className="w-14 h-14 text-amber-500" />
            <p className="text-sm text-amber-800 text-center font-medium">Sermon presentation slides are available for this message.</p>
            <div className="flex gap-3 flex-wrap justify-center">
              <Button
                onClick={() => window.open(sermon.slides_pdf, '_blank')}
                className="gap-2 bg-amber-600 hover:bg-amber-700 text-white"
              >
                <FileText className="w-4 h-4" /> View Slides
              </Button>
              <Button variant="outline" asChild className="gap-2 border-amber-300 text-amber-700 hover:bg-amber-50">
                <a href={sermon.slides_pdf} download target="_blank" rel="noreferrer">
                  <Download className="w-4 h-4" /> Download PDF
                </a>
              </Button>
            </div>
          </div>
          {sermon.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{sermon.description}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function SlidesGallery({ sermons }) {
  const [selected, setSelected] = useState(null);
  const withSlides = sermons.filter(s => s.slides_pdf);

  if (withSlides.length === 0) return null;

  return (
    <section className="mt-20 pt-16 border-t border-border">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
            <Presentation className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-amber-700 uppercase tracking-[0.2em] text-xs font-semibold">Study Resources</p>
        </div>
        <h2 className="font-heading text-3xl font-bold text-foreground mb-2">Presentation Slides</h2>
        <p className="text-muted-foreground max-w-xl">
          Download or view the presentation slides used during previous Sunday services for personal study and reflection.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {withSlides.map((sermon, i) => (
          <SlideCard key={sermon.id} sermon={sermon} index={i} onClick={setSelected} />
        ))}
      </div>

      <SlidesModal sermon={selected} onClose={() => setSelected(null)} />
    </section>
  );
}