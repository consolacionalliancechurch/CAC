import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { prayerRequestsService } from '@/services';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trash2, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700',
  in_agenda: 'bg-blue-100 text-blue-700',
  prayed_for: 'bg-green-100 text-green-700',
};

function DetailModal({ request, onClose, onDelete, isDeleting }) {
  if (!request) return null;
  return (
    <Dialog open={!!request} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Prayer Request Details</DialogTitle>
        </DialogHeader>

        <div className="py-2 space-y-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              <User className="w-4 h-4 text-muted-foreground" />
              {request.is_anonymous ? 'Anonymous' : (request.name || 'No name provided')}
            </span>
            <span className={`capitalize text-xs px-2.5 py-1 rounded-full ${STATUS_COLORS[request.status] || 'bg-muted text-muted-foreground'}`}>
              {request.status?.replace('_', ' ') || 'pending'}
            </span>
          </div>

          {request.created_at && (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              {format(new Date(request.created_at), 'MMMM d, yyyy · h:mm a')}
            </p>
          )}

          {request.category && (
            <span className="inline-block capitalize text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full">
              {request.category.replace('_', ' ')}
            </span>
          )}

          <div className="p-4 border bg-muted/40 border-border rounded-xl">
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">{request.request}</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <button onClick={onClose}
            className="px-4 py-2 text-sm font-medium transition border rounded-lg border-input hover:bg-muted">
            Close
          </button>
          <button onClick={onDelete} disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function PrayerRequestsAdmin() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState(null);
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
      setSelected(null);
    },
  });

  return (
    <>
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold font-heading text-foreground">Prayer Requests</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Submitted by the congregation — click a row to view the full request.
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
                  <tr key={r.id} onClick={() => setSelected(r)}
                    className="transition-colors cursor-pointer hover:bg-muted/20">
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
                    <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
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

      <DetailModal
        request={selected}
        onClose={() => setSelected(null)}
        onDelete={() => setDeleteTarget(selected)}
        isDeleting={del.isPending}
      />

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