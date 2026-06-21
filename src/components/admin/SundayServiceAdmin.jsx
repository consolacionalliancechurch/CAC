import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { sundayServicesService } from '@/services';
import { uploadFile } from '@/lib/uploadFile';
import AdminTable from './AdminTable';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, Loader2, X, ZoomIn, ZoomOut, Move } from 'lucide-react';

const COLUMNS = [
  { key: 'date', label: 'Date', render: v => v ? format(new Date(v), 'MMM d, yyyy') : '—' },
  { key: 'topic_title', label: 'Sermon Title' },
  { key: 'speaker_name', label: 'Speaker' },
  { key: 'is_upcoming', label: 'Status', render: v => v
    ? <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Upcoming</span>
    : <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Past</span>
  },
];

/* ── Reusable draggable photo field ── */
function DraggablePhotoField({ label, value, crop, folder, onChangeUrl, onChangeCrop, previewShape = 'wide' }) {
  const inputRef = useRef();
  const drag = useRef({ active: false, startX: 0, startY: 0, startObjX: 50, startObjY: 50 });
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [localPreview, setLocalPreview] = useState(null);

  const pos = { x: 50, y: 50, scale: 1, ...(crop || {}) };
  const displayImage = localPreview || value;

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview before upload finishes
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);

    setUploading(true);
    try {
      const url = await uploadFile(file, folder);
      onChangeUrl(url);
      onChangeCrop({ x: 50, y: 50, scale: 1 });
    } finally {
      setUploading(false);
      e.target.value = '';
      URL.revokeObjectURL(objectUrl);
      setLocalPreview(null);
    }
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    drag.current = { active: true, startX: e.clientX, startY: e.clientY, startObjX: pos.x, startObjY: pos.y };
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!drag.current.active) return;
    const sensitivity = 0.3;
    const newX = Math.max(0, Math.min(100, drag.current.startObjX - (e.clientX - drag.current.startX) * sensitivity));
    const newY = Math.max(0, Math.min(100, drag.current.startObjY - (e.clientY - drag.current.startY) * sensitivity));
    onChangeCrop({ ...pos, x: newX, y: newY });
  };

  const handleMouseUp = () => { drag.current.active = false; setIsDragging(false); };

  const zoom = (delta) => onChangeCrop({ ...pos, scale: Math.max(1, Math.min(3, +(pos.scale + delta).toFixed(1))) });

  // Portrait shape matches the actual hero speaker card (w-64 h-80 = 4:5 ratio)
  const shapeClass = previewShape === 'portrait'
    ? 'w-full max-w-[220px] mx-auto h-72'
    : 'w-full h-44';

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      <div className="space-y-2">
        {displayImage ? (
          <>
            {previewShape === 'portrait' && (
              <p className="text-xs text-muted-foreground">Preview — matches how it appears on the homepage</p>
            )}
            <div
              className={`relative rounded-xl overflow-hidden border border-border bg-muted select-none ${shapeClass} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <img
                src={displayImage}
                alt="preview"
                draggable={false}
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'cover',
                  objectPosition: `${pos.x}% ${pos.y}%`,
                  transform: `scale(${pos.scale})`,
                  transformOrigin: `${pos.x}% ${pos.y}%`,
                  pointerEvents: 'none',
                  transition: isDragging ? 'none' : 'transform 0.1s',
                }}
              />
              {!uploading && (
                <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full pointer-events-none">
                  <Move className="w-3 h-3" /> Drag to adjust
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
              {!uploading && value && (
                <button type="button"
                  onClick={(e) => { e.stopPropagation(); onChangeUrl(''); onChangeCrop(null); }}
                  className="absolute z-10 flex items-center justify-center w-6 h-6 text-white transition rounded-full top-2 right-2 bg-black/60 hover:bg-red-500">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Zoom controls */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Zoom:</span>
              <button type="button" onClick={() => zoom(-0.1)}
                className="flex items-center justify-center transition border rounded w-7 h-7 border-border hover:bg-muted">
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full transition-all rounded-full bg-primary" style={{ width: `${((pos.scale - 1) / 2) * 100}%` }} />
              </div>
              <button type="button" onClick={() => zoom(0.1)}
                className="flex items-center justify-center transition border rounded w-7 h-7 border-border hover:bg-muted">
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-xs text-right text-muted-foreground">{pos.scale.toFixed(1)}x</span>
            </div>
          </>
        ) : (
          <div onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center justify-center w-full h-32 gap-2 transition border-2 border-dashed cursor-pointer rounded-xl border-border hover:border-primary/50 text-muted-foreground hover:text-primary bg-muted/20">
            {uploading
              ? <Loader2 className="w-6 h-6 animate-spin" />
              : <><Upload className="w-6 h-6" /><span className="text-sm">Click to upload</span></>}
          </div>
        )}

        <div className="flex gap-2">
          <input type="text" value={value || ''} onChange={e => onChangeUrl(e.target.value)}
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
    </div>
  );
}

/* ── Form Modal ── */
function ServiceModal({ open, onClose, title, form, onChange, onSave, isSaving }) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="py-2 space-y-4">
          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Service Date <span className="text-red-500">*</span></label>
            <input type="date" value={form.date || ''} onChange={e => onChange('date', e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          {/* Sermon Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Sermon Title <span className="text-red-500">*</span></label>
            <input type="text" value={form.topic_title || ''} onChange={e => onChange('topic_title', e.target.value)}
              placeholder="e.g. Walking in God's Faithfulness"
              className="w-full px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <textarea value={form.topic_description || ''} onChange={e => onChange('topic_description', e.target.value)}
              placeholder="Brief description" rows={3}
              className="w-full px-3 py-2 text-sm border rounded-lg resize-none border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          {/* Speaker Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Speaker Name <span className="text-red-500">*</span></label>
            <input type="text" value={form.speaker_name || ''} onChange={e => onChange('speaker_name', e.target.value)}
              placeholder="e.g. Pastor Paulo Delposo"
              className="w-full px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          {/* Speaker Photo — draggable */}
          <DraggablePhotoField
            label="Speaker Photo"
            value={form.speaker_photo}
            crop={form.speaker_photo_crop}
            folder="speakers"
            previewShape="portrait"
            onChangeUrl={v => onChange('speaker_photo', v)}
            onChangeCrop={v => onChange('speaker_photo_crop', v)}
          />

          {/* Livestream URL */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Livestream URL</label>
            <input type="text" value={form.livestream_url || ''} onChange={e => onChange('livestream_url', e.target.value)}
              placeholder="https://facebook.com/live/..."
              className="w-full px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          {/* Upcoming toggle */}
          <div className="flex items-center gap-3">
            <button type="button"
              onClick={() => onChange('is_upcoming', !form.is_upcoming)}
              className={`w-10 h-6 rounded-full transition-colors relative ${form.is_upcoming ? 'bg-primary' : 'bg-muted'}`}>
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.is_upcoming ? 'left-5' : 'left-1'}`} />
            </button>
            <label className="text-sm font-medium">Mark as Upcoming</label>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm font-medium transition border rounded-lg border-input hover:bg-muted">
            Cancel
          </button>
          <button type="button" onClick={onSave}
            disabled={isSaving || !form.date || !form.topic_title || !form.speaker_name}
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
export default function SundayServiceAdmin() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ['sunday-services-admin'],
    queryFn: () => sundayServicesService.list(),
  });

  const save = useMutation({
    mutationFn: () => editId
      ? sundayServicesService.update(editId, form)
      : sundayServicesService.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sunday-services-admin'] });
      qc.invalidateQueries({ queryKey: ['services'] });
      closeModal();
    },
    onError: (err) => console.error('Save failed:', err.message),
  });

  const del = useMutation({
    mutationFn: id => sundayServicesService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sunday-services-admin'] });
      qc.invalidateQueries({ queryKey: ['services'] });
      setDeleteTarget(null);
    },
  });

  const openAdd = () => { setForm({ is_upcoming: false }); setEditId(null); setModal(true); };
  const openEdit = row => { setForm({ ...row }); setEditId(row.id); setModal(true); };
  const closeModal = () => { setModal(false); setForm({}); setEditId(null); };
  const change = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <>
      <AdminTable title="Sunday Services" columns={COLUMNS} data={data} isLoading={isLoading}
        onAdd={openAdd} onEdit={openEdit} onDelete={setDeleteTarget} />

      <ServiceModal
        open={modal}
        onClose={closeModal}
        title={editId ? 'Edit Sunday Service' : 'Add Sunday Service'}
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
        label={deleteTarget?.topic_title}
      />
    </>
  );
}