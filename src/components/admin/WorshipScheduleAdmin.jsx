import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { worshipSchedulesService } from '@/services';
import AdminTable from './AdminTable';
import AdminFormModal from './AdminFormModal';
import DeleteConfirmDialog from './DeleteConfirmDialog';

const FIELDS = [
  { key: 'service_name', label: 'Service Name', required: true, placeholder: 'e.g. Sunday Morning Worship' },
  { key: 'day_of_week', label: 'Day of Week', type: 'select', required: true, options: [
    { value: 'Sunday', label: 'Sunday' },
    { value: 'Monday', label: 'Monday' },
    { value: 'Tuesday', label: 'Tuesday' },
    { value: 'Wednesday', label: 'Wednesday' },
    { value: 'Thursday', label: 'Thursday' },
    { value: 'Friday', label: 'Friday' },
    { value: 'Saturday', label: 'Saturday' },
  ]},
  { key: 'time', label: 'Time', required: true, placeholder: 'e.g. 9:00 AM' },
  { key: 'location', label: 'Location', placeholder: 'e.g. Main Sanctuary' },
  { key: 'service_type', label: 'Service Type', type: 'select', options: [
    { value: 'worship', label: 'Worship' },
    { value: 'cellgroup', label: 'Cellgroup' },
    { value: 'prayer', label: 'Prayer' },
    { value: 'bible_study', label: 'Bible Study' },
    { value: 'youth', label: 'Youth' },
    { value: 'fellowship', label: 'Fellowship' },
    { value: 'special', label: 'Special' },
  ]},
  { key: 'fellowship_cancelled', label: 'Cancelled this week?', type: 'boolean' },
  { key: 'fellowship_cancel_reason', label: 'Cancellation Reason', placeholder: 'Optional reason' },
  { key: 'speaker_name', label: 'Speaker / Leader', placeholder: 'e.g. Pastor Armel Amit' },
  { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Additional details...' },
  { key: 'is_active', label: 'Active', type: 'boolean' },
];

const COLUMNS = [
  { key: 'service_name', label: 'Service' },
  { key: 'day_of_week', label: 'Day' },
  { key: 'time', label: 'Time' },
  { key: 'location', label: 'Location', render: v => v || '—' },
  { key: 'is_active', label: 'Status', render: v => v !== false
    ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Active</span>
    : <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Inactive</span>
  },
];

export default function WorshipScheduleAdmin() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ['worship-schedule-admin'],
    queryFn: () => worshipSchedulesService.list(),
  });

  const save = useMutation({
    mutationFn: () => editId
      ? worshipSchedulesService.update(editId, form)
      : worshipSchedulesService.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['worship-schedule-admin'] });
      qc.invalidateQueries({ queryKey: ['worship-schedules'] });
      closeModal();
    },
    onError: (err) => console.error('Save failed:', err.message),
  });

  const del = useMutation({
    mutationFn: id => worshipSchedulesService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['worship-schedule-admin'] });
      qc.invalidateQueries({ queryKey: ['worship-schedules'] });
      setDeleteTarget(null);
    },
  });

  const openAdd = () => { setForm({ is_active: true }); setEditId(null); setModal(true); };
  const openEdit = row => { setForm({ ...row }); setEditId(row.id); setModal(true); };
  const closeModal = () => { setModal(false); setForm({}); setEditId(null); };
  const change = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <>
      <AdminTable title="Worship Schedule" columns={COLUMNS} data={data} isLoading={isLoading} onAdd={openAdd} onEdit={openEdit} onDelete={setDeleteTarget} />
      <AdminFormModal open={modal} onClose={closeModal} title={editId ? 'Edit Schedule' : 'Add Schedule'} fields={FIELDS} data={form} onChange={change} onSave={() => save.mutate()} isSaving={save.isPending} />
      <DeleteConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => del.mutate(deleteTarget.id)} isDeleting={del.isPending} label={deleteTarget?.service_name} />
    </>
  );
}