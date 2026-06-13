import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cellgroupsService } from '@/services';
import AdminTable from './AdminTable';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const COLUMNS = [
  { key: 'day', label: 'Day' },
  { key: 'host_name', label: 'Host / Name' },
  { key: 'time', label: 'Time' },
  { key: 'location', label: 'Location' },
  { key: 'sort_order', label: 'Order' },
];

function CellgroupModal({ open, onClose, title, form, onChange, onSave, isSaving }) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="py-2 space-y-4">

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Host / Group Name <span className="text-red-500">*</span></label>
            <input type="text" value={form.host_name || ''} onChange={e => onChange('host_name', e.target.value)}
              placeholder="e.g. Elmer's House"
              className="w-full px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Day <span className="text-red-500">*</span></label>
            <select value={form.day || ''} onChange={e => onChange('day', e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Select day...</option>
              {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Time <span className="text-red-500">*</span></label>
            <input type="text" value={form.time || ''} onChange={e => onChange('time', e.target.value)}
              placeholder="e.g. 7:00 PM"
              className="w-full px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Location <span className="text-red-500">*</span></label>
            <input type="text" value={form.location || ''} onChange={e => onChange('location', e.target.value)}
              placeholder="e.g. Sapio Compound"
              className="w-full px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <textarea value={form.description || ''} onChange={e => onChange('description', e.target.value)}
              placeholder="Optional details..." rows={2}
              className="w-full px-3 py-2 text-sm border rounded-lg resize-none border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Display Order</label>
            <input type="number" value={form.sort_order ?? ''} onChange={e => onChange('sort_order', parseInt(e.target.value) || 0)}
              placeholder="1, 2, 3..."
              className="w-full px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm font-medium transition border rounded-lg border-input hover:bg-muted">Cancel</button>
          <button type="button" onClick={onSave}
            disabled={isSaving || !form.host_name || !form.day || !form.time || !form.location}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />} Save
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CellgroupsAdmin() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ['cellgroups-admin'],
    queryFn: () => cellgroupsService.list(),
  });

  const save = useMutation({
    mutationFn: () => editId ? cellgroupsService.update(editId, form) : cellgroupsService.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cellgroups-admin'] });
      qc.invalidateQueries({ queryKey: ['cellgroups'] });
      closeModal();
    },
    onError: err => console.error('Save failed:', err.message),
  });

  const del = useMutation({
    mutationFn: id => cellgroupsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cellgroups-admin'] });
      qc.invalidateQueries({ queryKey: ['cellgroups'] });
      setDeleteTarget(null);
    },
  });

  const openAdd = () => { setForm({ sort_order: data.length + 1 }); setEditId(null); setModal(true); };
  const openEdit = row => { setForm({ ...row }); setEditId(row.id); setModal(true); };
  const closeModal = () => { setModal(false); setForm({}); setEditId(null); };
  const change = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <>
      <AdminTable title="Cellgroups" columns={COLUMNS} data={data} isLoading={isLoading}
        onAdd={openAdd} onEdit={openEdit} onDelete={setDeleteTarget} />
      <CellgroupModal open={modal} onClose={closeModal} title={editId ? 'Edit Cellgroup' : 'Add Cellgroup'}
        form={form} onChange={change} onSave={() => save.mutate()} isSaving={save.isPending} />
      <DeleteConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={() => del.mutate(deleteTarget.id)} isDeleting={del.isPending} label={deleteTarget?.host_name} />
    </>
  );
}