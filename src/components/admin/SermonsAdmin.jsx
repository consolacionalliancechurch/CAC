import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { sermonsService } from '@/services';
import { uploadFile } from '@/lib/uploadFile';
import AdminTable from './AdminTable';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, Loader2, X, FileText, CheckCircle } from 'lucide-react';

const COLUMNS = [
  { key: 'date', label: 'Date', render: v => v ? format(new Date(v), 'MMM d, yyyy') : '—' },
  { key: 'title', label: 'Title' },
  { key: 'speaker_name', label: 'Speaker' },
  { key: 'series', label: 'Series', render: v => v || '—' },
];

/* ── Image upload field ── */
function ImageField({ label, value, folder, onChange }) {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file, folder);
      onChange(url);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {value && (
        <div className="relative w-full h-32 mb-2 overflow-hidden border rounded-xl border-border">
          <img src={value} alt="" className="object-cover w-full h-full" />
          <button type="button" onClick={() => onChange('')}
            className="absolute flex items-center justify-center w-6 h-6 text-white transition rounded-full top-2 right-2 bg-black/60 hover:bg-red-500">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
      <div className="flex gap-2">
        <input type="text" value={value || ''} onChange={e => onChange(e.target.value)}
          placeholder="Paste image URL..."
          className="flex-1 px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium border rounded-lg border-input bg-muted hover:bg-muted/80 transition disabled:opacity-50">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Upload
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

/* ── PDF upload field ── */
function PdfField({ label, value, folder, onChange }) {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file, folder);
      onChange(url);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const filename = value ? decodeURIComponent(value.split('/').pop().split('?')[0]).replace(/^\d+-[a-z0-9]+\./, '') : '';

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>

      {value ? (
        <div className="flex items-center gap-3 p-3 border rounded-xl border-border bg-muted/30">
          <div className="flex items-center justify-center flex-shrink-0 bg-red-100 rounded-lg w-9 h-9">
            <FileText className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{filename || 'PDF uploaded'}</p>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
              <CheckCircle className="w-3 h-3" /> Ready for download
            </p>
          </div>
          <button type="button" onClick={() => onChange('')}
            className="flex items-center justify-center flex-shrink-0 transition rounded-full w-7 h-7 hover:bg-muted text-muted-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div onClick={() => inputRef.current?.click()}
          className="flex items-center justify-center w-full h-20 gap-2 transition border-2 border-dashed cursor-pointer rounded-xl border-border hover:border-primary/50 text-muted-foreground hover:text-primary bg-muted/20">
          {uploading
            ? <><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Uploading PDF...</span></>
            : <><FileText className="w-5 h-5" /><span className="text-sm">Click to upload PDF slides</span></>}
        </div>
      )}

      <div className="flex gap-2">
        <input type="text" value={value || ''} onChange={e => onChange(e.target.value)}
          placeholder="Or paste PDF URL..."
          className="flex-1 px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium border rounded-lg border-input bg-muted hover:bg-muted/80 transition disabled:opacity-50">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Upload
        </button>
      </div>
      <input ref={inputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={handleFile} />
    </div>
  );
}

/* ── Form Modal ── */
function SermonModal({ open, onClose, title, form, onChange, onSave, isSaving }) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="py-2 space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Sermon Title <span className="text-red-500">*</span></label>
            <input type="text" value={form.title || ''} onChange={e => onChange('title', e.target.value)}
              placeholder="e.g. The Grace of God"
              className="w-full px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Date <span className="text-red-500">*</span></label>
            <input type="date" value={form.date || ''} onChange={e => onChange('date', e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          {/* Speaker */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Speaker <span className="text-red-500">*</span></label>
            <input type="text" value={form.speaker_name || ''} onChange={e => onChange('speaker_name', e.target.value)}
              placeholder="e.g. Pastor Armel Amit"
              className="w-full px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          {/* Scripture */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Scripture Reference</label>
            <input type="text" value={form.scripture_reference || ''} onChange={e => onChange('scripture_reference', e.target.value)}
              placeholder="e.g. John 3:16"
              className="w-full px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          {/* Series */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Sermon Series</label>
            <input type="text" value={form.series || ''} onChange={e => onChange('series', e.target.value)}
              placeholder="e.g. Walking in Faith"
              className="w-full px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tags <span className="text-xs font-normal text-muted-foreground">(comma-separated)</span></label>
            <input type="text" value={form.tags || ''} onChange={e => onChange('tags', e.target.value)}
              placeholder="e.g. faithfulness, hope, trust"
              className="w-full px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <textarea value={form.description || ''} onChange={e => onChange('description', e.target.value)}
              placeholder="Summary or sermon notes..." rows={3}
              className="w-full px-3 py-2 text-sm border rounded-lg resize-none border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          {/* Thumbnail */}
          <ImageField label="Cover / Thumbnail" value={form.thumbnail} folder="sermons/thumbnails"
            onChange={v => onChange('thumbnail', v)} />

          {/* Video link */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Video Link (YouTube / Facebook)</label>
            <input type="text" value={form.video_url || ''} onChange={e => onChange('video_url', e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          {/* PDF slides */}
          <PdfField label="Sermon Slides (PDF)" value={form.slides_pdf} folder="sermons/slides"
            onChange={v => onChange('slides_pdf', v)} />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm font-medium transition border rounded-lg border-input hover:bg-muted">
            Cancel
          </button>
          <button type="button" onClick={onSave}
            disabled={isSaving || !form.title || !form.date || !form.speaker_name}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Main ── */
export default function SermonsAdmin() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ['sermons-admin'],
    queryFn: () => sermonsService.list(),
  });

  const save = useMutation({
    mutationFn: () => editId
      ? sermonsService.update(editId, form)
      : sermonsService.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sermons-admin'] });
      qc.invalidateQueries({ queryKey: ['sermons'] });
      closeModal();
    },
    onError: (err) => console.error('Save failed:', err.message),
  });

  const del = useMutation({
    mutationFn: id => sermonsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sermons-admin'] });
      qc.invalidateQueries({ queryKey: ['sermons'] });
      setDeleteTarget(null);
    },
  });

  const openAdd = () => { setForm({}); setEditId(null); setModal(true); };
  const openEdit = row => { setForm({ ...row }); setEditId(row.id); setModal(true); };
  const closeModal = () => { setModal(false); setForm({}); setEditId(null); };
  const change = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <>
      <AdminTable title="Sermons" columns={COLUMNS} data={data} isLoading={isLoading}
        onAdd={openAdd} onEdit={openEdit} onDelete={setDeleteTarget} />

      <SermonModal
        open={modal}
        onClose={closeModal}
        title={editId ? 'Edit Sermon' : 'Add Sermon'}
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