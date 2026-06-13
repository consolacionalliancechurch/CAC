import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { BookOpen, User, Calendar, ExternalLink, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

function ServiceCard({ service, index }) {
  const [hovered, setHovered] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        className="relative cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setDetailOpen(true)}
      >
        <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/20 hover:shadow-md transition-all duration-300">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                {service.date ? format(new Date(service.date), 'MMMM d, yyyy') : ''}
              </p>
              <h3 className="font-heading font-bold text-foreground mb-1 group-hover:text-primary">{service.topic_title}</h3>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <User className="w-3 h-3" /> {service.speaker_name}
              </p>
            </div>
          </div>
        </div>

        {/* Hover tooltip */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="absolute bottom-full left-0 mb-2 w-72 bg-popover border border-border rounded-xl shadow-xl p-4 z-30 pointer-events-none"
            >
              <p className="font-heading font-bold text-sm text-foreground mb-1">{service.topic_title}</p>
              {service.date && <p className="text-xs text-muted-foreground mb-1">{format(new Date(service.date), 'MMMM d, yyyy')}</p>}
              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2"><User className="w-3 h-3" />{service.speaker_name}</p>
              {service.topic_description && <p className="text-xs text-muted-foreground line-clamp-3">{service.topic_description}</p>}
              <p className="text-xs text-primary font-medium mt-2">Click for details</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Detail dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">{service.topic_title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {service.background_image && (
              <img src={service.background_image} alt="" className="w-full h-40 object-cover rounded-xl" />
            )}
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              {service.date && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{format(new Date(service.date), 'MMMM d, yyyy')}</span>}
              <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{service.speaker_name}</span>
            </div>
            {service.topic_description && <p className="text-sm text-foreground leading-relaxed">{service.topic_description}</p>}
          </div>
          <div className="flex gap-2 pt-2">
            <Button asChild className="gap-2">
              <Link to="/sermons" onClick={() => setDetailOpen(false)}>
                <ExternalLink className="w-4 h-4" /> See More in Sermons
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function ServiceHistory({ services }) {
  const pastServices = (services || []).filter(s => !s.is_upcoming).slice(0, 4);

  if (pastServices.length === 0) return null;

  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-12"
        >
          <div className="text-center w-full">
            <p className="text-primary uppercase tracking-[0.2em] text-xs font-semibold mb-2">Past Sundays</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Recent Messages</h2>
          </div>
        </motion.div>

        <div className="space-y-4">
          {pastServices.map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} />
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <Link to="/sermons" className="flex items-center gap-2 text-sm text-primary hover:underline font-medium">
            View All Sermons <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}