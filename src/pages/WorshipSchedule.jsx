import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { cellgroupsService, activitiesService } from '@/services';
import { Clock, MapPin, Home, Heart, Calendar, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, startOfDay, isBefore, isSameDay, addDays } from 'date-fns';
import { useHeartReaction } from '@/hooks/useHeartReaction';

const DAY_ORDER = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

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

function HeartButton({ namespace, id }) {
  const { hearted, count, toggle } = useHeartReaction(namespace, id);
  return (
    <button onClick={toggle}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border
        ${hearted
          ? 'bg-red-50 border-red-200 text-red-500'
          : 'bg-muted/50 border-border text-muted-foreground hover:border-red-200 hover:text-red-400'
        }`}>
      <Heart className={`w-4 h-4 transition-all ${hearted ? 'fill-red-500 text-red-500 scale-110' : ''}`} />
      {count > 0 && <span>{count}</span>}
    </button>
  );
}

function EventCard({ event, isToday, isTomorrow }) {
  const color = categoryColors[event.category] || categoryColors.general;
  return (
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
  );
}

function CellgroupCard({ cg }) {
  return (
    <div className="p-5 transition border bg-card border-border rounded-2xl hover:shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary mb-0.5">{cg.day}</p>
          <h3 className="flex items-center gap-2 text-xl font-bold font-heading">
            <Home className="w-4 h-4 text-muted-foreground" />
            {cg.host_name}
          </h3>
          {cg.description && <p className="mt-1 text-sm text-muted-foreground">{cg.description}</p>}
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-3.5 h-3.5" /> {cg.time}
            </span>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" /> {cg.location}
            </span>
            <HeartButton namespace="cellgroup" id={cg.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorshipSchedule() {
  const today = startOfDay(new Date());

  const { data: activities = [], isLoading: loadingActivities } = useQuery({
    queryKey: ['activities-schedule-page'],
    queryFn: () => activitiesService.list(),
  });

  const { data: cellgroups = [], isLoading: loadingCellgroups } = useQuery({
    queryKey: ['cellgroups'],
    queryFn: () => cellgroupsService.list(),
  });

  const upcomingEvents = React.useMemo(() => {
    return activities
      .filter(a => a.date && !isBefore(startOfDay(new Date(a.date)), today))
      .map(a => ({ ...a, nextDate: startOfDay(new Date(a.date)) }))
      .sort((a, b) => a.nextDate - b.nextDate);
  }, [activities, today]);

  const sortedCellgroups = [...cellgroups].sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day));
  const isLoading = loadingActivities || loadingCellgroups;

  return (
    <div className="min-h-screen px-4 pt-24 pb-16 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <p className="mb-2 text-sm font-medium tracking-widest uppercase text-primary">Join Us</p>
          <h1 className="mb-4 text-4xl font-bold font-heading sm:text-5xl text-foreground">Schedule</h1>
          <p className="text-lg text-muted-foreground">We'd love to see you. Here's when and where we gather.</p>
        </div>

        {isLoading ? (
          <div className="space-y-10">
            <div className="space-y-3">
              <Skeleton className="w-48 h-6" />
              {[1,2].map(i => <Skeleton key={i} className="w-full h-20 rounded-xl" />)}
            </div>
            <div className="border-t border-border" />
            <div className="space-y-3">
              <Skeleton className="w-48 h-6" />
              {[1,2,3].map(i => (
                <div key={i} className="p-5 space-y-3 border rounded-2xl border-border">
                  <Skeleton className="w-20 h-4" />
                  <Skeleton className="w-1/3 h-6" />
                  <Skeleton className="w-1/2 h-4" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            <section>
              <h2 className="flex items-center gap-2 mb-4 text-lg font-bold font-heading text-foreground">
                <span className="inline-block w-1 h-5 rounded-full bg-primary" />
                Upcoming Events
              </h2>
              {upcomingEvents.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No upcoming events right now.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {upcomingEvents.map(event => (
                    <EventCard key={event.id} event={event}
                      isToday={isSameDay(event.nextDate, today)}
                      isTomorrow={isSameDay(event.nextDate, addDays(today, 1))} />
                  ))}
                </div>
              )}
            </section>

            <div className="border-t border-border" />

            <section>
              <h2 className="flex items-center gap-2 mb-1 text-lg font-bold font-heading text-foreground">
                <span className="inline-block w-1 h-5 rounded-full bg-primary" />
                Cellgroup Schedule
              </h2>
              <p className="mb-4 ml-3 text-sm text-muted-foreground">Weekday home gatherings — everyone is welcome.</p>
              {sortedCellgroups.length === 0
                ? <p className="ml-3 text-sm text-muted-foreground">No cellgroups added yet.</p>
                : <div className="flex flex-col gap-3">{sortedCellgroups.map(cg => <CellgroupCard key={cg.id} cg={cg} />)}</div>
              }
            </section>
          </div>
        )}
      </div>
    </div>
  );
}