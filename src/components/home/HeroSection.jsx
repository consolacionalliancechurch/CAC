import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, Play, Church } from 'lucide-react';
import { format, isPast, startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';

function IdleHero() {
  return (
    <section className="relative flex items-center min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        <img src="/church-bg.jpg" alt="Church" className="object-cover w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-br from-foreground/80 via-foreground/60 to-foreground/40" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center w-full px-6 pt-32 pb-20 text-center sm:px-10 lg:px-16">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="max-w-2xl">
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-8 overflow-hidden border rounded-full bg-primary/20 border-primary/30">
            <img src="/CACLogo.jpg" alt="Church Logo" className="object-cover w-full h-full" />
          </div>
          <p className="text-background/50 uppercase tracking-[0.25em] text-xs font-medium mb-4">Consolacion Alliance Church</p>
          <h1 className="mb-6 text-4xl font-bold leading-tight font-heading sm:text-5xl lg:text-6xl text-background">
            Join Us This Sunday
          </h1>
          <p className="mb-10 text-lg leading-relaxed text-background/60">
            We gather every Sunday to worship, learn, and grow together in faith. You're always welcome here.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 px-5 py-3 text-sm border rounded-full bg-background/10 border-background/20 text-background/80">
              <Calendar className="w-4 h-4 text-primary" /> Every Sunday · 8:00 AM
            </div>
            <div className="flex items-center gap-2 px-5 py-3 text-sm border rounded-full bg-background/10 border-background/20 text-background/80">
              <Church className="w-4 h-4 text-primary" /> Consolacion, Cebu
            </div>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}

export default function HeroSection({ nextService }) {
  const hasRealData = nextService &&
    nextService.topic_title &&
    nextService.topic_title !== 'Coming Soon' &&
    nextService.speaker_name !== 'Coming Soon';

  if (!hasRealData) return <IdleHero />;

  const isLive = !!nextService.livestream_url;

  const serviceDate = nextService.date ? new Date(nextService.date) : null;
  const isPastService = serviceDate
    ? isPast(startOfDay(new Date(serviceDate.getTime() + 24 * 60 * 60 * 1000)))
    : false;
  const messageLabel = isPastService ? "Last Sunday's Message" : "Next Sunday's Message";
  const formattedDate = serviceDate ? format(serviceDate, 'MMMM d, yyyy') : 'This Sunday';

  return (
    <section className="relative flex items-center min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        <img src="/church-bg.jpg" alt="Church sanctuary" className="object-cover w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-foreground/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-foreground/20" />
      </div>

      <div className="relative z-10 w-full px-6 pt-32 pb-20 sm:px-10 lg:px-16">
        <div className="grid items-center gap-12 lg:grid-cols-2">

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

            <p className="text-background/50 uppercase tracking-[0.25em] text-xs font-medium mb-3">{messageLabel}</p>

            <h1 className="mb-6 text-4xl font-bold leading-tight font-heading sm:text-5xl lg:text-6xl text-background">
              {nextService.topic_title}
            </h1>

            <p className="max-w-lg mb-8 text-lg leading-relaxed text-background/60">
              {nextService.topic_description || 'Join us every Sunday as we gather to worship, learn, and grow together in faith.'}
            </p>

            {nextService.livestream_url && (
              <Button size="lg"
                className="gap-2 px-8 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/25"
                onClick={() => window.open(nextService.livestream_url, '_blank')}>
                <Play className="w-4 h-4" />
                {isLive ? 'Watch Live' : 'Watch Stream'}
              </Button>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }} className="justify-center hidden lg:flex">
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/20 rounded-3xl blur-2xl" />
              <div className="relative p-8 border bg-background/10 backdrop-blur-sm rounded-2xl border-background/10">
                {nextService.speaker_photo ? (
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
                    <User className="w-3.5 h-3.5" /> Speaker
                  </div>
                  <p className="text-xl font-bold font-heading text-background">{nextService.speaker_name}</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}