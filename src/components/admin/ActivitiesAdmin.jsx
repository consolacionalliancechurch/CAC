import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { activitiesService } from '@/services';
import { uploadFile } from '@/lib/uploadFile';
import AdminTable from './AdminTable';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2, Plus } from 'lucide-react';

const CATEGORIES = [
  { value: 'youth', label: 'Youth' },
  { value: 'men', label: "Men's" },
  { value: 'women', label: "Women's" },
  { value: 'worship', label: 'Worship' },
  { value: 'outreach', label: 'Outreach' },
  { value: 'missions', label: 'Missions' },
  { value: 'fellowship', label: 'Fellowship' },
  { value: 'general', label: 'General' },
];

const COLUMNS = [
  { key: 'date', label: 'Date', render: v => v ? format(new Date(v), 'MMM d, yyyy') : '—' },
  { key: 'title', label: 'Title' },
  { key: 'category', label: 'Category', render: v => v ? <span className="capitalize text-xs bg-muted px-2 py-0.5 rounded-full">{v}</span> : '—' },
  { key: 'location', label: 'Location' },
];

function CoverImageField({ value, onChange, folder }) {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const url = await uploadFile(file, folder);
      onChange(url);
    } catch (err) {
      setError('Upload failed. Try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {value && (
        <div className="relative w-full overflow-hidden border h-44 rounded-xl border-border">
          <img src={value} alt="cover" className="object-cover w-full h-full" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute flex items-center justify-center w-6 h-6 text-white rounded-full top-2 right-2 bg-black/60 hover:bg-black/80"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="https://..."
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          className="flex-1 px-3 py-2 text-sm border rounded-lg border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-sm hover:bg-muted transition disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function PhotosField({ value = [], onChange, folder }) {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const [doneCount, setDoneCount] = useState(0);
  const [error, setError] = useState('');

  const handleFile = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setError('');
    setUploading(true);
    setUploadCount(files.length);
    setDoneCount(0);
    try {
      const urls = [];
      for (const f of files) {
        const url = await uploadFile(f, folder);
        urls.push(url);
        setDoneCount(d => d + 1);
      }
      onChange([...value, ...urls]);
    } catch (err) {
      setError('Upload failed. Try again.');
    } finally {
      setUploading(false);
      setUploadCount(0);
      setDoneCount(0);
      e.target.value = '';
    }
  };

  const remove = (idx) => onChange(value.filter((_, i) => i !== idx));

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-5 gap-2">
        {value.map((url, idx) => (
          <div key={idx} className="relative overflow-hidden border rounded-lg aspect-square border-border group">
            <img src={url} alt={`photo-${idx}`} className="object-cover w-full h-full" />
            <button
              type="button"
              onClick={() => remove(idx)}
              className="absolute flex items-center justify-center w-5 h-5 transition rounded-full opacity-0 top-1 right-1 bg-black/60 hover:bg-red-500 group-hover:opacity-100"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex flex-col items-center justify-center gap-1 transition border-2 border-dashed rounded-lg aspect-square border-border hover:border-primary/50 text-muted-foreground hover:text-primary disabled:opacity-50 bg-muted/30"
        >
          {uploading
            ? <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-xs">{doneCount}/{uploadCount}</span>
              </>
            : <><Plus className="w-5 h-5" /><span className="text-xs">Add</span></>
          }
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFile} />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {value.length > 0 && (
        <p className="text-xs text-muted-foreground">{value.length} photo{value.length !== 1 ? 's' : ''} — click + to add more, hover a photo to remove it</p>
      )}
    </div>
  );
}

function ActivityModal({ open, onClose, editId, initialData, onSuccess }) {
  const [form, setForm] = useState(initialData || {});
  const qc = useQueryClient();

  React.useEffect(() => {
    setForm(initialData || {});
  }, [initialData, open]);

  const change = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = useMutation({
    mutationFn: () => editId
      ? activitiesService.update(editId, form)
      : activitiesService.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activities-admin'] });
      qc.invalidateQueries({ queryKey: ['activities'] });
      onClose();
      onSuccess?.();
    },
    onError: (err) => console.error('Save failed:', err.message),
  });

  const photos = Array.isArray(form.photos) ? form.photos : [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading">
            {editId ? 'Edit Activity' : 'Add Activity'}
          </DialogTitle>
        </DialogHeader>

        <div className="py-2 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Activity Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Youth Retreat 2026"
              value={form.title || ''}
              onChange={e => change('title', e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.date || ''}
              onChange={e => change('date', e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Category</label>
            <select
              value={form.category || ''}
              onChange={e => change('category', e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Select...</option>
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Location</label>
            <input
              type="text"
              placeholder="e.g. Church Sanctuary"
              value={form.location || ''}
              onChange={e => change('location', e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea
              rows={3}
              placeholder="What happened at this activity?"
              value={form.description || ''}
              onChange={e => change('description', e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg resize-none border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Cover Image</label>
            <CoverImageField
              value={form.cover_image}
              onChange={v => change('cover_image', v)}
              folder="activities/covers"
            />
          </div>

          {/* Activity Photos slideshow */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Activity Photos <span className="text-xs font-normal text-muted-foreground">(slideshow)</span>
            </label>
            <PhotosField
              value={photos}
              onChange={v => change('photos', v)}
              folder="activities/photos"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} disabled={save.isPending}>Cancel</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
              : 'Save'
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ActivitiesAdmin() {
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [initialData, setInitialData] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ['activities-admin'],
    queryFn: () => activitiesService.list(),
  });

  const del = useMutation({
    mutationFn: id => activitiesService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activities-admin'] });
      qc.invalidateQueries({ queryKey: ['activities'] });
      setDeleteTarget(null);
    },
  });

  const openAdd = () => { setInitialData({}); setEditId(null); setModal(true); };
  const openEdit = row => { setInitialData({ ...row }); setEditId(row.id); setModal(true); };

  return (
    <>
      <AdminTable
        title="Activities"
        columns={COLUMNS}
        data={data}
        isLoading={isLoading}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
      />
      <ActivityModal
        open={modal}
        onClose={() => setModal(false)}
        editId={editId}
        initialData={initialData}
      />
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => del.mutate(deleteTarget.id)}
        isDeleting={del.isPending}
        label={deleteTarget?.title}
      />
    </>
  );
}