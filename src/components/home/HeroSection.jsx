
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, Play, Clock } from 'lucide-react';
import { format, isAfter, isSameDay } from 'date-fns';
import { Button } from '@/components/ui/button';

export default function HeroSection({ nextService }) {
  const isLive = new Date().getDay() === 0;
  
  const serviceDate = nextService?.date ? new Date(nextService.date) : null;
  const formattedDate = serviceDate ? format(serviceDate, 'MMMM d, yyyy') : 'This Sunday';

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={nextService?.background_image || "https://media.db.com/images/public/6a1e2292826a8f7c12507142/2673e4723_generated_f820deaa.png"}
          alt="Church sanctuary"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-foreground/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-foreground/20" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left â€” The Word */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-2 mb-6">
              {isLive ? (
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/20 text-red-300 text-sm font-medium border border-red-500/30">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                  Live Now
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/10 text-background/80 text-sm font-medium border border-background/20">
                  <Calendar className="w-3.5 h-3.5" />
                  {formattedDate}
                </span>
              )}
            </div>

            <p className="text-background/50 uppercase tracking-[0.25em] text-xs font-medium mb-3">Next Sunday's Message</p>
            
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-background leading-tight mb-6">
              {nextService?.topic_title || "Walking in God's Faithfulness"}
            </h1>

            <p className="text-background/60 text-lg max-w-lg leading-relaxed mb-8">
              {nextService?.topic_description || "Join us as we explore the boundless faithfulness of God and how it shapes our daily walk of faith."}
            </p>

            {nextService?.livestream_url && (
              <Button 
                size="lg"
                className="rounded-full px-8 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
                onClick={() => window.open(nextService.livestream_url, '_blank')}
              >
                <Play className="w-4 h-4" />
                {isLive ? 'Watch Live' : 'Watch Stream'}
              </Button>
            )}
          </motion.div>

          {/* Right â€” The Messenger */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:flex justify-center"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/20 rounded-3xl blur-2xl" />
              <div className="relative bg-background/10 backdrop-blur-sm rounded-2xl p-8 border border-background/10">
                {nextService?.speaker_photo ? (
                  <img
                    src={nextService.speaker_photo}
                    alt={nextService.speaker_name}
                    className="w-64 h-80 object-cover rounded-xl mb-6"
                  />
                ) : (
                  <div className="w-64 h-80 rounded-xl mb-6 overflow-hidden">
                    <img
                      src="https://media.db.com/images/public/6a1e2292826a8f7c12507142/98d7b13fa_generated_ce11452a.png"
                      alt="Speaker"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-background/50 text-sm mb-2">
                    <User className="w-3.5 h-3.5" />
                    <span>Speaker</span>
                  </div>
                  <p className="font-heading text-xl font-bold text-background">
                    {nextService?.speaker_name || "Pastor Armel Amit"}
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