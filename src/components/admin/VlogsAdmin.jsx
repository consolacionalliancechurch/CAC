import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { vlogsService } from '@/services';
import { uploadFile } from '@/lib/uploadFile';
import AdminTable from './AdminTable';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { X, Plus, Loader2, Upload, ImageIcon } from 'lucide-react';

const CATEGORIES = [
  { value: 'ministry', label: 'Ministry' },
  { value: 'testimony', label: 'Testimony' },
  { value: 'worship', label: 'Worship' },
  { value: 'outreach', label: 'Outreach' },
  { value: 'fellowship', label: 'Fellowship' },
  { value: 'general', label: 'General' },
];

const COLUMNS = [
  { key: 'date', label: 'Date', render: v => v ? format(new Date(v), 'MMM d, yyyy') : '—' },
  { key: 'title', label: 'Title' },
  { key: 'category', label: 'Category', render: v => v || '—' },
];

/* ── Thumbnail field with upload button ── */
function ThumbnailField({ value, onChange }) {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file, 'vlogs/thumbnails');
      onChange(url);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {value && (
        <div className="relative w-full overflow-hidden border rounded-lg h-36 border-border">
          <img src={value} alt="thumbnail" className="object-cover w-full h-full" />
          <button type="button" onClick={() => onChange('')}
            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-red-500 flex items-center justify-center text-white transition">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder="Paste image URL..."
          className="flex-1 px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium border rounded-lg border-input bg-muted hover:bg-muted/80 transition disabled:opacity-50">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Upload
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
    </div>
  );
}

/* ── Photos slideshow field ── */
function PhotosField({ value = [], onChange }) {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [doneCount, setDoneCount] = useState(0);
  const [uploadCount, setUploadCount] = useState(0);
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
        const url = await uploadFile(f, 'vlogs/photos');
        urls.push(url);
        setDoneCount(d => d + 1);
      }
      onChange([...value, ...urls]);
    } catch {
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
            <img src={url} alt="" className="object-cover w-full h-full" />
            <button type="button" onClick={() => remove(idx)}
              className="absolute flex items-center justify-center w-5 h-5 text-white transition rounded-full opacity-0 top-1 right-1 bg-black/60 hover:bg-red-500 group-hover:opacity-100">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
          className="flex flex-col items-center justify-center gap-1 transition border-2 border-dashed rounded-lg aspect-square border-border hover:border-primary/50 text-muted-foreground hover:text-primary disabled:opacity-50 bg-muted/30">
          {uploading
            ? <><Loader2 className="w-5 h-5 animate-spin" /><span className="text-xs">{doneCount}/{uploadCount}</span></>
            : <><Plus className="w-5 h-5" /><span className="text-xs">Add</span></>}
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFile} />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {value.length > 0 && (
        <p className="text-xs text-muted-foreground">{value.length} photo{value.length !== 1 ? 's' : ''} — hover to remove</p>
      )}
    </div>
  );
}

/* ── Form Modal ── */
function VlogModal({ open, onClose, title, form, onChange, onSave, isSaving }) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="py-2 space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Blog Title <span className="text-red-500">*</span></label>
            <input type="text" value={form.title || ''} onChange={e => onChange('title', e.target.value)}
              placeholder="e.g. Youth Camp 2025 Highlights"
              className="w-full px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Date <span className="text-red-500">*</span></label>
            <input type="date" value={form.date || ''} onChange={e => onChange('date', e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Category</label>
            <select value={form.category || ''} onChange={e => onChange('category', e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Select...</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <textarea value={form.description || ''} onChange={e => onChange('description', e.target.value)}
              placeholder="What is this blog about?"
              rows={3}
              className="w-full px-3 py-2 text-sm border rounded-lg resize-none border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          {/* Thumbnail */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4" /> Thumbnail / Cover Photo
            </label>
            <ThumbnailField value={form.thumbnail} onChange={v => onChange('thumbnail', v)} />
          </div>

          {/* Photos slideshow */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Photos (slideshow)</label>
            <PhotosField value={form.photos || []} onChange={v => onChange('photos', v)} />
            <p className="text-xs text-muted-foreground">Upload multiple photos. Click + to add more.</p>
          </div>

          {/* YouTube */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">YouTube Video Link</label>
            <input type="text" value={form.youtube_url || ''} onChange={e => onChange('youtube_url', e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm font-medium transition border rounded-lg border-input hover:bg-muted">
            Cancel
          </button>
          <button type="button" onClick={onSave} disabled={isSaving || !form.title || !form.date}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Main component ── */
export default function VlogsAdmin() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ['vlogs-admin'],
    queryFn: () => vlogsService.list(),
  });

  const save = useMutation({
    mutationFn: () => editId
      ? vlogsService.update(editId, form)
      : vlogsService.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vlogs-admin'] });
      qc.invalidateQueries({ queryKey: ['vlogs'] });
      closeModal();
    },
    onError: (err) => console.error('Save failed:', err.message),
  });

  const del = useMutation({
    mutationFn: id => vlogsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vlogs-admin'] });
      qc.invalidateQueries({ queryKey: ['vlogs'] });
      setDeleteTarget(null);
    },
  });

  const openAdd = () => { setForm({}); setEditId(null); setModal(true); };
  const openEdit = row => { setForm({ ...row }); setEditId(row.id); setModal(true); };
  const closeModal = () => { setModal(false); setForm({}); setEditId(null); };
  const change = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <>
      <AdminTable title="Blogs" columns={COLUMNS} data={data} isLoading={isLoading}
        onAdd={openAdd} onEdit={openEdit} onDelete={setDeleteTarget} />

      <VlogModal
        open={modal}
        onClose={closeModal}
        title={editId ? 'Edit Vlog' : 'Add Vlog'}
        form={form}
        onChange={change}
        onSave={() => save.mutate()}
        isSaving={save.isPending}
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