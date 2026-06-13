import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowRight, MapPin, Calendar, Images, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AutoSlideshow from '@/components/shared/AutoSlideshow';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PhotoGallery from '@/components/shared/PhotoGallery';

const categoryLabels = {
  youth: 'Youth', men: 'Men', women: 'Women', worship: 'Worship',
  outreach: 'Outreach', missions: 'Missions', fellowship: 'Fellowship', general: 'General'
};

function ActivityCard({ activity, index }) {
  const [hovered, setHovered] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);

  const allPhotos = [
    ...(activity.cover_image ? [activity.cover_image] : []),
    ...(activity.photos || []).filter(p => p !== activity.cover_image),
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="group relative cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setDetailOpen(true)}
      >
        <div className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-500">
          <div className="relative h-56">
            {allPhotos.length > 0 ? (
              <AutoSlideshow photos={allPhotos} className="w-full h-full" />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground text-sm">No photo</span>
              </div>
            )}
            {activity.category && (
              <Badge className="absolute top-4 left-4 z-10 bg-secondary text-secondary-foreground border-0">
                {categoryLabels[activity.category] || activity.category}
              </Badge>
            )}
          </div>
          <div className="p-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              {activity.date ? format(new Date(activity.date), 'MMMM d, yyyy') : ''}
            </p>
            <h3 className="font-heading text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
              {activity.title}
            </h3>
            {activity.location && (
              <p className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                <MapPin className="w-3 h-3" /> {activity.location}
              </p>
            )}
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{activity.description}</p>
          </div>
        </div>

        {/* Hover popup tooltip */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-popover border border-border rounded-xl shadow-xl p-4 z-30 pointer-events-none"
            >
              <p className="font-heading font-bold text-sm text-foreground mb-1">{activity.title}</p>
              {activity.date && <p className="text-xs text-muted-foreground mb-1">{format(new Date(activity.date), 'MMMM d, yyyy')}</p>}
              {activity.location && <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2"><MapPin className="w-3 h-3" />{activity.location}</p>}
              <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{activity.description}</p>
              <p className="text-xs text-primary font-medium mt-2">Click to see details</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Detail dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">{activity.title}</DialogTitle>
          </DialogHeader>
          {allPhotos.length > 0 && (
            <div className="relative h-48 rounded-xl overflow-hidden cursor-pointer" onClick={() => { setDetailOpen(false); setGalleryOpen(true); }}>
              <AutoSlideshow photos={allPhotos} className="w-full h-full" />
              {allPhotos.length > 1 && (
                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full z-10">
                  <Images className="w-3 h-3 inline mr-1" />{allPhotos.length} photos
                </div>
              )}
            </div>
          )}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              {activity.date && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{format(new Date(activity.date), 'MMMM d, yyyy')}</span>}
              {activity.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{activity.location}</span>}
            </div>
            <p className="text-sm text-foreground leading-relaxed line-clamp-4">{activity.description}</p>
          </div>
          <div className="flex gap-2 pt-2">
            <Button asChild className="gap-2">
              <Link to="/activities" onClick={() => setDetailOpen(false)}>
                <ExternalLink className="w-4 h-4" /> See More
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <PhotoGallery photos={allPhotos} open={galleryOpen} onClose={() => setGalleryOpen(false)} />
    </>
  );
}

export default function ActivityHighlights({ activities }) {
  const recentActivities = (activities || []).slice(0, 3);

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <p className="text-primary uppercase tracking-[0.2em] text-xs font-semibold mb-2">The Great Commission</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Church Activities</h2>
          </div>
          <Link to="/activities" className="hidden sm:flex items-center gap-2 text-sm text-primary hover:underline font-medium">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {recentActivities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentActivities.map((activity, i) => (
              <ActivityCard key={activity.id} activity={activity} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p className="font-heading text-xl">No activities yet</p>
            <p className="text-sm mt-2">Check back soon for upcoming events</p>
          </div>
        )}

        <Link to="/activities" className="sm:hidden flex items-center justify-center gap-2 mt-8 text-sm text-primary font-medium">
          View All Activities <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}