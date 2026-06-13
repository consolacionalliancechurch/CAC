import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { celebrationsService } from '@/services';
import { uploadFile } from '@/lib/uploadFile';
import AdminTable from './AdminTable';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, Upload, Loader2, ZoomIn, ZoomOut, Move } from 'lucide-react';

const COLUMNS = [
  { key: 'member_name', label: 'Name' },
  { key: 'type', label: 'Type', render: v => (
    <span className={`capitalize text-xs px-2 py-0.5 rounded-full ${v === 'birthday' ? 'bg-pink-100 text-pink-700' : 'bg-rose-100 text-rose-700'}`}>{v}</span>
  )},
  { key: 'date', label: 'Date', render: v => v ? format(new Date(v), 'MMM d, yyyy') : '—' },
  { key: 'message', label: 'Message', render: v => v ? v.substring(0, 40) + (v.length > 40 ? '...' : '') : '—' },
];

/* ── Draggable / zoomable photo field ── */
function PhotoField({ value, crop, onChangeUrl, onChangeCrop }) {
  const inputRef = useRef();
  const imgRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Keep all drag state in a ref so callbacks never go stale
  const drag = useRef({ active: false, startX: 0, startY: 0, startObjX: 50, startObjY: 50 });

  const pos = { x: 50, y: 50, scale: 1, ...(crop || {}) };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file, 'celebrations');
      onChangeUrl(url);
      onChangeCrop({ x: 50, y: 50, scale: 1 });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    drag.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      startObjX: pos.x,
      startObjY: pos.y,
    };
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!drag.current.active) return;
    // Each pixel of movement = 0.3% shift in object-position (feels natural)
    const sensitivity = 0.3;
    const newX = Math.max(0, Math.min(100, drag.current.startObjX - (e.clientX - drag.current.startX) * sensitivity));
    const newY = Math.max(0, Math.min(100, drag.current.startObjY - (e.clientY - drag.current.startY) * sensitivity));
    onChangeCrop({ ...pos, x: newX, y: newY });
  };

  const handleMouseUp = () => {
    drag.current.active = false;
    setIsDragging(false);
  };

  const zoom = (delta) => {
    onChangeCrop({ ...pos, scale: Math.max(1, Math.min(3, +(pos.scale + delta).toFixed(1))) });
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="space-y-2">
          {/* Draggable preview */}
          <div
            className={`relative w-full h-48 rounded-xl overflow-hidden border border-border bg-muted select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              ref={imgRef}
              src={value}
              alt="preview"
              draggable={false}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: `${pos.x}% ${pos.y}%`,
                transform: `scale(${pos.scale})`,
                transformOrigin: `${pos.x}% ${pos.y}%`,
                pointerEvents: 'none',
                transition: isDragging ? 'none' : 'transform 0.1s',
              }}
            />
            <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full pointer-events-none">
              <Move className="w-3 h-3" /> Drag to adjust
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChangeUrl(''); onChangeCrop(null); }}
              className="absolute z-10 flex items-center justify-center w-6 h-6 text-white transition rounded-full top-2 right-2 bg-black/60 hover:bg-red-500"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Zoom:</span>
            <button type="button" onClick={() => zoom(-0.1)}
              className="flex items-center justify-center transition border rounded w-7 h-7 border-border hover:bg-muted">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full transition-all rounded-full bg-primary"
                style={{ width: `${((pos.scale - 1) / 2) * 100}%` }} />
            </div>
            <button type="button" onClick={() => zoom(0.1)}
              className="flex items-center justify-center transition border rounded w-7 h-7 border-border hover:bg-muted">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-xs text-right text-muted-foreground">{pos.scale.toFixed(1)}x</span>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center w-full h-32 gap-2 transition border-2 border-dashed cursor-pointer rounded-xl border-border hover:border-primary/50 text-muted-foreground hover:text-primary bg-muted/20">
          {uploading
            ? <Loader2 className="w-6 h-6 animate-spin" />
            : <><Upload className="w-6 h-6" /><span className="text-sm">Click to upload photo</span></>
          }
        </div>
      )}

      {/* URL + Upload button */}
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
  );
}

/* ── Form Modal ── */
function CelebrationModal({ open, onClose, title, form, onChange, onSave, isSaving }) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="py-2 space-y-4">
          {/* Member Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Member Name <span className="text-red-500">*</span></label>
            <input type="text" value={form.member_name || ''} onChange={e => onChange('member_name', e.target.value)}
              placeholder="Full name"
              className="w-full px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Type <span className="text-red-500">*</span></label>
            <select value={form.type || ''} onChange={e => onChange('type', e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Select...</option>
              <option value="birthday">Birthday</option>
              <option value="anniversary">Anniversary</option>
            </select>
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Date <span className="text-red-500">*</span></label>
            <input type="date" value={form.date || ''} onChange={e => onChange('date', e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          {/* Member Photo */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Member Photo</label>
            <PhotoField
              value={form.photo}
              crop={form.photo_crop}
              onChangeUrl={v => onChange('photo', v)}
              onChangeCrop={v => onChange('photo_crop', v)}
            />
          </div>

          {/* Greeting Message */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Greeting Message</label>
            <textarea value={form.message || ''} onChange={e => onChange('message', e.target.value)}
              placeholder="A special message..."
              rows={3}
              className="w-full px-3 py-2 text-sm border rounded-lg resize-none border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm font-medium transition border rounded-lg border-input hover:bg-muted">
            Cancel
          </button>
          <button type="button" onClick={onSave}
            disabled={isSaving || !form.member_name || !form.type || !form.date}
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
export default function CelebrationsAdmin() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ['celebrations-admin'],
    queryFn: () => celebrationsService.list(),
  });

  const save = useMutation({
    mutationFn: () => editId
      ? celebrationsService.update(editId, form)
      : celebrationsService.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['celebrations-admin'] });
      qc.invalidateQueries({ queryKey: ['celebrations'] });
      closeModal();
    },
    onError: (err) => console.error('Save failed:', err.message),
  });

  const del = useMutation({
    mutationFn: id => celebrationsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['celebrations-admin'] });
      qc.invalidateQueries({ queryKey: ['celebrations'] });
      setDeleteTarget(null);
    },
  });

  const openAdd = () => { setForm({}); setEditId(null); setModal(true); };
  const openEdit = row => { setForm({ ...row }); setEditId(row.id); setModal(true); };
  const closeModal = () => { setModal(false); setForm({}); setEditId(null); };
  const change = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <>
      <AdminTable title="Celebrations" columns={COLUMNS} data={data} isLoading={isLoading}
        onAdd={openAdd} onEdit={openEdit} onDelete={setDeleteTarget} />

      <CelebrationModal
        open={modal}
        onClose={closeModal}
        title={editId ? 'Edit Celebration' : 'Add Celebration'}
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
        label={deleteTarget?.member_name}
      />
    </>
  );
}