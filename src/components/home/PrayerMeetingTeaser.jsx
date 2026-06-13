import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, Clock, MapPin, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cellgroupsService } from '@/services';

const CARD_COLORS = [
  { color: 'bg-primary/5 border-primary/20', accent: 'text-primary', badge: 'bg-primary/10 text-primary' },
  { color: 'bg-secondary/5 border-secondary/20', accent: 'text-secondary', badge: 'bg-secondary/10 text-secondary' },
  { color: 'bg-amber-50 border-amber-200', accent: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
  { color: 'bg-emerald-50 border-emerald-200', accent: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
  { color: 'bg-sky-50 border-sky-200', accent: 'text-sky-600', badge: 'bg-sky-100 text-sky-700' },
  { color: 'bg-violet-50 border-violet-200', accent: 'text-violet-600', badge: 'bg-violet-100 text-violet-700' },
];

export default function PrayerMeetingTeaser() {
  const { data: cellgroups = [], isLoading } = useQuery({
    queryKey: ['cellgroups'],
    queryFn: () => cellgroupsService.list(),
  });

  return (
    <section className="px-6 py-20 bg-foreground/3">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Home className="w-4 h-4 text-primary" />
              <p className="text-primary uppercase tracking-[0.2em] text-xs font-semibold">Weekday Gatherings</p>
            </div>
            <h2 className="text-3xl font-bold font-heading sm:text-4xl text-foreground">Cellgroup</h2>
          </div>
          <Link to="/prayer-meeting" className="items-center hidden gap-2 text-sm font-medium sm:flex text-primary hover:underline">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {[1, 2].map(i => <div key={i} className="h-36 bg-muted rounded-2xl animate-pulse" />)}
          </div>
        ) : cellgroups.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No cellgroups added yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {cellgroups.map((cg, i) => {
              const style = CARD_COLORS[i % CARD_COLORS.length];
              return (
                <motion.div key={cg.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Link to="/prayer-meeting">
                    <div className={`rounded-2xl border p-7 ${style.color} hover:shadow-lg transition-all duration-300 group`}>
                      <div className="flex items-start justify-between mb-4">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${style.badge}`}>{cg.day}</span>
                        <ArrowRight className={`w-4 h-4 ${style.accent} opacity-0 group-hover:opacity-100 transition-opacity`} />
                      </div>
                      <h3 className="mb-4 text-xl font-bold font-heading text-foreground">{cg.host_name}</h3>
                      <div className="space-y-2">
                        <p className={`flex items-center gap-2 text-sm font-semibold ${style.accent}`}>
                          <Clock className="w-4 h-4" /> {cg.time}
                        </p>
                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" /> {cg.location}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        <Link to="/prayer-meeting" className="flex items-center justify-center gap-2 mt-6 text-sm font-medium sm:hidden text-primary">
          View All Cellgroups <ArrowRight className="w-4 h-4" />
        </Link>

        <motion.blockquote initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="mt-10 text-center">
          <p className="text-lg italic font-heading text-muted-foreground">
            "Where two or three gather in my name, there am I with them."
          </p>
          <p className="mt-1 text-sm text-primary">— Matthew 18:20</p>
        </motion.blockquote>
      </div>
    </section>
  );
}