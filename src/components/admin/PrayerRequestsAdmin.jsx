import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { prayerRequestsService } from '@/services';
import AdminTable from './AdminTable';
import AdminFormModal from './AdminFormModal';
import DeleteConfirmDialog from './DeleteConfirmDialog';

const FIELDS = [
  { key: 'name', label: 'Name', placeholder: 'Requester name' },
  { key: 'request', label: 'Prayer Request', type: 'textarea', required: true },
  { key: 'category', label: 'Category', type: 'select', options: [
    { value: 'healing', label: 'Healing' },
    { value: 'family', label: 'Family' },
    { value: 'guidance', label: 'Guidance' },
    { value: 'thanksgiving', label: 'Thanksgiving' },
    { value: 'financial', label: 'Financial' },
    { value: 'spiritual_growth', label: 'Spiritual Growth' },
    { value: 'missions', label: 'Missions' },
    { value: 'other', label: 'Other' },
  ]},
  { key: 'status', label: 'Status', type: 'select', options: [
    { value: 'pending', label: 'Pending' },
    { value: 'in_agenda', label: 'In Agenda' },
    { value: 'prayed_for', label: 'Prayed For' },
  ]},
  { key: 'is_anonymous', label: 'Anonymous', type: 'boolean' },
];

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700',
  in_agenda: 'bg-blue-100 text-blue-700',
  prayed_for: 'bg-green-100 text-green-700',
};

const COLUMNS = [
  { key: 'name', label: 'Name', render: (v, row) => row.is_anonymous ? 'Anonymous' : (v || '—') },
  { key: 'request', label: 'Request', render: v => v?.substring(0, 50) + (v?.length > 50 ? '...' : '') },
  { key: 'category', label: 'Category', render: v => v
    ? <span className="capitalize text-xs bg-muted px-2 py-0.5 rounded-full">{v.replace('_', ' ')}</span>
    : '—'
  },
  { key: 'status', label: 'Status', render: v =>
    <span className={`capitalize text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[v] || 'bg-muted text-muted-foreground'}`}>
      {v?.replace('_', ' ') || '—'}
    </span>
  },
];

export default function PrayerRequestsAdmin() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ['prayer-requests-admin'],
    queryFn: () => prayerRequestsService.list(),
  });

  const save = useMutation({
    mutationFn: () => editId
      ? prayerRequestsService.update(editId, form)
      : prayerRequestsService.submit(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['prayer-requests-admin'] });
      closeModal();
    },
    onError: (err) => console.error('Save failed:', err.message),
  });

  const del = useMutation({
    mutationFn: id => prayerRequestsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['prayer-requests-admin'] });
      setDeleteTarget(null);
    },
  });

  const openAdd = () => { setForm({ status: 'pending', is_anonymous: false }); setEditId(null); setModal(true); };
  const openEdit = row => { setForm({ ...row }); setEditId(row.id); setModal(true); };
  const closeModal = () => { setModal(false); setForm({}); setEditId(null); };
  const change = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <>
      <AdminTable title="Prayer Requests" columns={COLUMNS} data={data} isLoading={isLoading}
        onAdd={openAdd} onEdit={openEdit} onDelete={setDeleteTarget} />
      <AdminFormModal open={modal} onClose={closeModal}
        title={editId ? 'Edit Prayer Request' : 'Add Prayer Request'}
        fields={FIELDS} data={form} onChange={change}
        onSave={() => save.mutate()} isSaving={save.isPending} />
      <DeleteConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={() => del.mutate(deleteTarget.id)} isDeleting={del.isPending}
        label="this prayer request" />
    </>
  );
}