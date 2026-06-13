import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { celebrationsService } from '@/services';
import CelebrationCard from '@/components/CelebrationCard';
import { Heart } from 'lucide-react';

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Birthdays', value: 'birthday' },
  { label: 'Anniversaries', value: 'anniversary' },
];

export default function Celebrations() {
  const [filter, setFilter] = useState('all');

  const { data: celebrations = [], isLoading } = useQuery({
    queryKey: ['celebrations'],
    queryFn: () => celebrationsService.getThisMonth(),
  });

  const filtered = filter === 'all'
    ? celebrations
    : celebrations.filter(c => c.type === filter);

  return (
    <div className="min-h-screen px-4 pt-24 pb-16 sm:px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-2 text-3xl">🎉</div>
          <h1 className="mb-3 text-5xl font-bold font-heading text-foreground">Celebrations</h1>
          <p className="text-lg text-muted-foreground">
            Birthdays and anniversaries we celebrated and prayed for this past Sunday.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex justify-center gap-2 mb-10">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === f.value
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {f.value === 'all' && <span>🎊</span>}
              {f.value === 'birthday' && <span>🎂</span>}
              {f.value === 'anniversary' && <span>💝</span>}
              {f.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 rounded-full border-muted border-t-primary animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground">No celebrations to show.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c, i) => (
              <CelebrationCard key={c.id} celebration={c} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}