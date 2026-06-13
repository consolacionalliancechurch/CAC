import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { format, subDays, isAfter } from 'date-fns';
import { Cake, ArrowRight, PartyPopper, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import CelebrationCard from '@/components/CelebrationCard';

function CelebrationPreview({ celebration, index }) {
  const [hovered, setHovered] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const isBirthday = celebration.type === 'birthday';
  const dateStr = celebration.date ? format(new Date(celebration.date), 'MMMM d') : '';

  return (
    <>
      <motion.div
        className="relative cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setDetailOpen(true)}
      >
        <CelebrationCard celebration={celebration} index={index} />

        {/* Hover tooltip */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-popover border border-border rounded-xl shadow-xl p-4 z-30 pointer-events-none"
            >
              <p className="font-heading font-bold text-sm text-foreground mb-1">{celebration.member_name}</p>
              <p className="text-xs text-muted-foreground mb-1">{isBirthday ? '🎂 Birthday' : '💍 Anniversary'} — {dateStr}</p>
              {celebration.message && <p className="text-xs text-muted-foreground line-clamp-2">{celebration.message}</p>}
              <p className="text-xs text-primary font-medium mt-2">Click to view</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Detail popup */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">{celebration.member_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {celebration.photo && (
              <img src={celebration.photo} alt={celebration.member_name} className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-primary/20" />
            )}
            <p className="text-center text-sm text-muted-foreground">{isBirthday ? '🎂 Birthday' : '💍 Anniversary'} — {dateStr}</p>
            {celebration.message && <p className="text-sm text-foreground leading-relaxed text-center">{celebration.message}</p>}
          </div>
          <div className="flex justify-center pt-2">
            <Button asChild className="gap-2">
              <Link to="/celebrations" onClick={() => setDetailOpen(false)}>
                <ExternalLink className="w-4 h-4" /> See More
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function CelebrationWall({ celebrations }) {
  // Only show past 7 days (same as Celebrations page)
  const sevenDaysAgo = subDays(new Date(), 7);
  const recent = (celebrations || []).filter(c => {
    if (!c.date) return false;
    return isAfter(new Date(c.date), sevenDaysAgo);
  }).slice(0, 6);

  return (
    <section className="py-24 px-6 bg-muted/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-3">
            <PartyPopper className="w-5 h-5 text-primary" />
            <p className="text-primary uppercase tracking-[0.2em] text-xs font-semibold">Fellowship Wall</p>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Birthdays & Anniversaries</h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">Celebrating the milestones of our beloved church family this week</p>
        </motion.div>

        {recent.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recent.map((c, i) => (
              <CelebrationPreview key={c.id} celebration={c} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Cake className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-heading text-lg">No celebrations this week</p>
          </div>
        )}

        <div className="text-center mt-10">
          <Link to="/celebrations" className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium">
            See All Celebrations <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}