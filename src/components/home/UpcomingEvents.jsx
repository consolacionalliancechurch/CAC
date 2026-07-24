import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { activitiesService } from '@/services';
import { motion } from 'framer-motion';
import { format, isSameDay, startOfDay, isBefore, addDays } from 'date-fns';
import { Calendar, MapPin, ChevronRight, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const categoryColors = {
  youth:      'bg-blue-50 text-blue-600 border-blue-200',
  women:      'bg-pink-50 text-pink-600 border-pink-200',
  men:        'bg-indigo-50 text-indigo-600 border-indigo-200',
  worship:    'bg-primary/10 text-primary border-primary/20',
  outreach:   'bg-green-50 text-green-700 border-green-200',
  missions:   'bg-amber-50 text-amber-700 border-amber-200',
  fellowship: 'bg-teal-50 text-teal-600 border-teal-200',
  general:    'bg-orange-50 text-orange-600 border-orange-200',
};

export default function UpcomingEvents() {
  const today = startOfDay(new Date());

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activities-upcoming'],
    queryFn: () => activitiesService.list(),
  });

  const upcoming = React.useMemo(() => {
    return activities
      .filter(a => a.date && !isBefore(startOfDay(new Date(a.date)), today))
      .map(a => ({ ...a, nextDate: startOfDay(new Date(a.date)) }))
      .sort((a, b) => a.nextDate - b.nextDate)
      .slice(0, 10);
  }, [activities, today]);

  return (
    <section className="px-6 py-20 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="flex flex-col justify-between gap-4 mb-10 sm:flex-row sm:items-end">
          <div>
            <p className="text-primary uppercase tracking-[0.2em] text-xs font-semibold mb-2">This Week & Beyond</p>
            <h2 className="text-3xl font-bold font-heading sm:text-4xl text-foreground">Upcoming Events</h2>
            <p className="max-w-lg mt-2 text-muted-foreground">
              Stay connected with your church family — join us for worship, prayer, fellowship, and special activities.
            </p>
          </div>
          <Link to="/worship-schedule"
            className="shrink-0 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            Full Schedule <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-20 border bg-card rounded-xl animate-pulse border-border" />)}
          </div>
        ) : upcoming.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-heading">No upcoming events</p>
            <p className="mt-1 text-sm">Add activities in the admin panel</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((event, i) => {
              const color = categoryColors[event.category] || categoryColors.general;
              const isToday = isSameDay(event.nextDate, today);
              const isTomorrow = isSameDay(event.nextDate, addDays(today, 1));
              return (
                <motion.div key={event.id} initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}>
                  <Link to="/activities">
                    <div className={`bg-card border rounded-xl px-5 py-4 flex items-center gap-4 hover:shadow-md transition-shadow duration-300 ${
                      isToday ? 'ring-2 ring-primary/20 border-primary/20' : 'border-border'
                    }`}>
                      <div className={`shrink-0 text-center w-16 ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                        <p className="text-xs font-medium leading-tight tracking-wide uppercase">
                          {isToday ? 'Today' : isTomorrow ? 'Tmrw' : format(event.nextDate, 'EEE')}
                        </p>
                        <p className="text-2xl font-bold leading-tight font-heading">{format(event.nextDate, 'd')}</p>
                        <p className="text-xs leading-tight">{format(event.nextDate, 'MMM')}</p>
                      </div>

                      <div className="w-px h-12 bg-border shrink-0" />

                      <div className={`shrink-0 hidden sm:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${color}`}>
                        <Activity className="w-3 h-3" /> {event.category || 'Activity'}
                      </div>

                      {event.cover_image && (
                        <div className="hidden w-12 h-12 overflow-hidden border rounded-lg shrink-0 border-border sm:block">
                          <img src={event.cover_image} alt={event.title} className="object-cover w-full h-full" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold leading-snug font-heading text-foreground">{event.title}</p>
                        {event.location && (
                          <p className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />{event.location}
                          </p>
                        )}
                      </div>

                      {isToday && (
                        <span className="shrink-0 text-xs bg-primary text-primary-foreground px-2.5 py-1 rounded-full font-medium">Today</span>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}