import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, Play } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

export default function HeroSection({ nextService }) {
  const isLive = new Date().getDay() === 0;
  const serviceDate = nextService?.date ? new Date(nextService.date) : null;
  const formattedDate = serviceDate ? format(serviceDate, 'MMMM d, yyyy') : 'This Sunday';

  return (
    <section className="relative flex items-center min-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        {nextService?.background_image ? (
          <img src={nextService.background_image} alt="Church sanctuary" className="object-cover w-full h-full" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-stone-800 to-stone-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-foreground/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-foreground/20" />
      </div>

      {/* Content — full width, no side gutters that shrink it */}
      <div className="relative z-10 w-full px-6 pt-32 pb-20 sm:px-10 lg:px-16">
        <div className="grid items-center gap-12 lg:grid-cols-2">

          {/* Left — Message */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center gap-2 mb-6">
              {isLive ? (
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/20 text-red-300 text-sm font-medium border border-red-500/30">
                  <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" /> Live Now
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/10 text-background/80 text-sm font-medium border border-background/20">
                  <Calendar className="w-3.5 h-3.5" /> {formattedDate}
                </span>
              )}
            </div>

            <p className="text-background/50 uppercase tracking-[0.25em] text-xs font-medium mb-3">Next Sunday's Message</p>

            <h1 className="mb-6 text-4xl font-bold leading-tight font-heading sm:text-5xl lg:text-6xl text-background">
              {nextService?.topic_title || 'Coming Soon'}
            </h1>

            <p className="max-w-lg mb-8 text-lg leading-relaxed text-background/60">
              {nextService?.topic_description || 'Join us every Sunday as we gather to worship, learn, and grow together in faith.'}
            </p>

            {nextService?.livestream_url && (
              <Button size="lg"
                className="gap-2 px-8 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/25"
                onClick={() => window.open(nextService.livestream_url, '_blank')}>
                <Play className="w-4 h-4" />
                {isLive ? 'Watch Live' : 'Watch Stream'}
              </Button>
            )}
          </motion.div>

          {/* Right — Speaker card */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }} className="justify-center hidden lg:flex">
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/20 rounded-3xl blur-2xl" />
              <div className="relative p-8 border bg-background/10 backdrop-blur-sm rounded-2xl border-background/10">
                {nextService?.speaker_photo ? (
                  <img src={nextService.speaker_photo} alt={nextService.speaker_name}
                    className="object-cover w-64 mb-6 h-80 rounded-xl"
                    style={{
                      objectPosition: nextService.speaker_photo_crop
                        ? `${nextService.speaker_photo_crop.x ?? 50}% ${nextService.speaker_photo_crop.y ?? 50}%`
                        : 'center'
                    }} />
                ) : (
                  <div className="flex items-center justify-center w-64 mb-6 h-80 rounded-xl bg-background/20">
                    <User className="w-16 h-16 text-background/30" />
                  </div>
                )}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2 text-sm text-background/50">
                    <User className="w-3.5 h-3.5" />
                    <span>Speaker</span>
                  </div>
                  <p className="text-xl font-bold font-heading text-background">
                    {nextService?.speaker_name || 'Coming Soon'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}