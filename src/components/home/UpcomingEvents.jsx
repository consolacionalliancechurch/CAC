import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { worshipSchedulesService } from '@/services';
import { motion } from 'framer-motion';
import { format, isSameDay, startOfDay } from 'date-fns';
import { Calendar, Clock, MapPin, Music, Heart, BookOpen, Users, Star, Coffee, ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const serviceTypeConfig = {
  worship:     { icon: Music,    label: 'Worship',     color: 'bg-primary/10 text-primary border-primary/20' },
  prayer:      { icon: Heart,    label: 'Prayer',      color: 'bg-rose-50 text-rose-600 border-rose-200' },
  bible_study: { icon: BookOpen, label: 'Bible Study', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  youth:       { icon: Users,    label: 'Youth',       color: 'bg-blue-50 text-blue-600 border-blue-200' },
  special:     { icon: Star,     label: 'Special',     color: 'bg-purple-50 text-purple-600 border-purple-200' },
  fellowship:  { icon: Coffee,   label: 'Fellowship',  color: 'bg-green-50 text-green-700 border-green-200' },
  cellgroup:   { icon: Home,     label: 'Cellgroup',   color: 'bg-teal-50 text-teal-600 border-teal-200' },
};

const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function getUpcomingOccurrences(schedules, limit = 8) {
  const today = startOfDay(new Date());
  const todayIndex = today.getDay();
  return schedules.map(schedule => {
    const schedDayIndex = dayNames.indexOf(schedule.day_of_week);
    if (schedDayIndex === -1) return null;
    let diff = schedDayIndex - todayIndex;
    if (diff < 0) diff += 7;
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + diff);
    return { ...schedule, nextDate };
  }).filter(Boolean)
    .sort((a, b) => a.nextDate - b.nextDate || (a.time || '').localeCompare(b.time || ''))
    .slice(0, limit);
}

export default function UpcomingEvents() {
  const today = startOfDay(new Date());

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ['worship-schedules-home'],
    queryFn: () => worshipSchedulesService.listActive(),
  });

  const upcoming = getUpcomingOccurrences(schedules);

  return (
    <section className="px-6 py-20 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="flex flex-col justify-between gap-4 mb-10 sm:flex-row sm:items-end">
          <div>
            <p className="text-primary uppercase tracking-[0.2em] text-xs font-semibold mb-2">This Week & Beyond</p>
            <h2 className="text-3xl font-bold font-heading sm:text-4xl text-foreground">Upcoming Events</h2>
            <p className="max-w-lg mt-2 text-muted-foreground">
              Stay connected with your church family — join us for worship, prayer, and fellowship throughout the week.
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
            <p className="mt-1 text-sm">Add weekly schedules in the admin panel</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((event, i) => {
              const config = serviceTypeConfig[event.service_type] || serviceTypeConfig.worship;
              const Icon = config.icon;
              const isToday = isSameDay(event.nextDate, today);
              const isTomorrow = isSameDay(event.nextDate, new Date(today.getTime() + 86400000));

              return (
                <motion.div key={`${event.id}-${i}`} initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}>
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

                    <div className={`shrink-0 hidden sm:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${config.color}`}>
                      <Icon className="w-3 h-3" />{config.label}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold leading-snug font-heading text-foreground">{event.service_name}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-muted-foreground">
                        {event.time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{event.time}</span>}
                        {event.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.location}</span>}
                      </div>
                    </div>

                    {isToday && (
                      <span className="shrink-0 text-xs bg-primary text-primary-foreground px-2.5 py-1 rounded-full font-medium">Today</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}