import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { prayerRequestsService } from '@/services';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import { Trash2 } from 'lucide-react';

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700',
  in_agenda: 'bg-blue-100 text-blue-700',
  prayed_for: 'bg-green-100 text-green-700',
};

export default function PrayerRequestsAdmin() {
  const qc = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ['prayer-requests-admin'],
    queryFn: () => prayerRequestsService.list(),
  });

  const del = useMutation({
    mutationFn: id => prayerRequestsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['prayer-requests-admin'] });
      setDeleteTarget(null);
    },
  });

  return (
    <>
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold font-heading text-foreground">Prayer Requests</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Submitted by the congregation — view and delete only.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="border-4 rounded-full w-7 h-7 border-muted border-t-primary animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="py-10 text-sm text-center text-muted-foreground">No prayer requests yet.</div>
        ) : (
          <div className="overflow-hidden border border-border rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left uppercase text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left uppercase text-muted-foreground">Request</th>
                  <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left uppercase text-muted-foreground">Category</th>
                  <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left uppercase text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold tracking-wider text-right uppercase text-muted-foreground">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.map(r => (
                  <tr key={r.id} className="transition-colors hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                      {r.is_anonymous ? 'Anonymous' : (r.name || '—')}
                    </td>
                    <td className="max-w-sm px-4 py-3 text-muted-foreground">
                      <p className="line-clamp-2">{r.request}</p>
                    </td>
                    <td className="px-4 py-3">
                      {r.category
                        ? <span className="capitalize text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                            {r.category.replace('_', ' ')}
                          </span>
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`capitalize text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[r.status] || 'bg-muted text-muted-foreground'}`}>
                        {r.status?.replace('_', ' ') || 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setDeleteTarget(r)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => del.mutate(deleteTarget.id)}
        isDeleting={del.isPending}
        label="this prayer request"
      />
    </>
  );
}