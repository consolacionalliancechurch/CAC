import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { worshipSchedulesService, cellgroupsService } from '@/services';
import { Clock, MapPin, AlertCircle, Home, Heart, StickyNote } from 'lucide-react';
import { useHeartReaction } from '@/hooks/useHeartReaction';

const DAY_ORDER = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

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

function ScheduleCard({ schedule }) {
  const hasCover = !!schedule.cover_image;

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${schedule.fellowship_cancelled ? 'border-amber-300' : 'border-border'} bg-card`}>
      <div className="flex min-h-[120px]">
        {/* Left: content */}
        <div className="z-10 flex-1 p-5">
          {schedule.fellowship_cancelled && (
            <div className="flex items-center gap-2 px-2 py-1 mb-2 text-xs font-medium border rounded-lg text-amber-600 bg-amber-50 border-amber-200 w-fit">
              <AlertCircle className="w-3.5 h-3.5" />
              Cancelled{schedule.fellowship_cancel_reason ? `: ${schedule.fellowship_cancel_reason}` : ' this week'}
            </div>
          )}
          <p className="text-xs font-bold uppercase tracking-wider text-primary mb-0.5">{schedule.day_of_week}</p>
          <h3 className="text-xl font-bold font-heading text-foreground">{schedule.service_name}</h3>
          {schedule.speaker_name && (
            <p className="text-sm text-muted-foreground mt-0.5">{schedule.speaker_name}</p>
          )}
          {schedule.description && (
            <p className="mt-1 text-sm text-muted-foreground">{schedule.description}</p>
          )}

          {/* Meta + heart */}
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-3.5 h-3.5" /> {schedule.time}
            </span>
            {schedule.location && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" /> {schedule.location}
              </span>
            )}
            <HeartButton namespace="schedule" id={schedule.id} />
          </div>

          {/* Note */}
          {schedule.note && (
            <div className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
              <StickyNote className="w-3 h-3 mt-0.5 shrink-0" />
              <span>{schedule.note}</span>
            </div>
          )}
        </div>

        {/* Right: faded cover image */}
        {hasCover && (
          <div className="relative overflow-hidden w-36 sm:w-48 shrink-0">
            <img src={schedule.cover_image} alt="" className="absolute inset-0 object-cover w-full h-full" />
            <div className="absolute inset-0 bg-gradient-to-r from-card via-card/30 to-transparent" />
          </div>
        )}
      </div>
    </div>
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
  const { data: schedules = [], isLoading: loadingSchedules } = useQuery({
    queryKey: ['worship-schedules'],
    queryFn: () => worshipSchedulesService.listActive(),
  });

  const { data: cellgroups = [], isLoading: loadingCellgroups } = useQuery({
    queryKey: ['cellgroups'],
    queryFn: () => cellgroupsService.list(),
  });

  const sorted = [...schedules].sort((a, b) => DAY_ORDER.indexOf(a.day_of_week) - DAY_ORDER.indexOf(b.day_of_week));
  const sortedCellgroups = [...cellgroups].sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day));
  const isLoading = loadingSchedules || loadingCellgroups;

  return (
    <div className="min-h-screen px-4 pt-24 pb-16 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <p className="mb-2 text-sm font-medium tracking-widest uppercase text-primary">Join Us</p>
          <h1 className="mb-4 text-4xl font-bold font-heading sm:text-5xl text-foreground">Schedule</h1>
          <p className="text-lg text-muted-foreground">We'd love to see you. Here's when and where we gather.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 rounded-full border-muted border-t-primary animate-spin" />
          </div>
        ) : (
          <div className="space-y-10">
            <section>
              <h2 className="flex items-center gap-2 mb-4 text-lg font-bold font-heading text-foreground">
                <span className="inline-block w-1 h-5 rounded-full bg-primary" />
                Worship Schedule
              </h2>
              {sorted.length === 0
                ? <p className="text-sm text-muted-foreground">No worship schedules available.</p>
                : <div className="flex flex-col gap-3">{sorted.map(s => <ScheduleCard key={s.id} schedule={s} />)}</div>
              }
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