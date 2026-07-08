import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pastorsService } from '@/services';
import { uploadFile } from '@/lib/uploadFile';
import AdminTable from './AdminTable';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, Loader2, X, ZoomIn, ZoomOut, Move } from 'lucide-react';

const COLUMNS = [
  { key: 'photo', label: 'Photo', render: v => v
    ? <img src={v} alt="" className="object-cover w-10 h-10 border rounded-full border-border" />
    : <div className="flex items-center justify-center w-10 h-10 text-xs rounded-full bg-muted text-muted-foreground">?</div>
  },
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role' },
  { key: 'sort_order', label: 'Order' },
];

/* ── Draggable / zoomable rectangular photo field ── */
function PhotoField({ value, crop, onChangeUrl, onChangeCrop }) {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [localPreview, setLocalPreview] = useState(null);

  // Keep all drag state in a ref so callbacks never go stale
  const drag = useRef({ active: false, startX: 0, startY: 0, startObjX: 50, startObjY: 0 });

  const pos = { x: 50, y: 0, scale: 1, ...(crop || {}) };
  const displayImage = localPreview || value;

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview before upload finishes
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);

    setUploading(true);
    try {
      const url = await uploadFile(file, 'pastors');
      onChangeUrl(url);
      onChangeCrop({ x: 50, y: 0, scale: 1 });
    } finally {
      setUploading(false);
      e.target.value = '';
      URL.revokeObjectURL(objectUrl);
      setLocalPreview(null);
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
      {displayImage ? (
        <div className="space-y-2">
          <p className="text-xs text-center text-muted-foreground">Preview — matches how it appears on the About page</p>
          {/* Draggable rectangular preview — matches real PastorsSection card (w-full h-96) */}
          <div
            className={`relative w-full max-w-[260px] mx-auto h-80 rounded-xl overflow-hidden border-2 border-border bg-muted select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
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
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
            )}
            {!uploading && value && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onChangeUrl(''); onChangeCrop(null); }}
                className="absolute z-10 flex items-center justify-center w-6 h-6 text-white transition rounded-full top-2 right-2 bg-black/60 hover:bg-red-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {!uploading && (
            <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Move className="w-3 h-3" /> Drag the photo to adjust
            </p>
          )}

          {/* Zoom controls */}
          <div className="flex items-center max-w-xs gap-2 mx-auto">
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
          className="flex flex-col items-center justify-center w-full max-w-[260px] h-80 gap-2 mx-auto transition border-2 border-dashed rounded-xl cursor-pointer border-border hover:border-primary/50 text-muted-foreground hover:text-primary bg-muted/20">
          {uploading
            ? <Loader2 className="w-6 h-6 animate-spin" />
            : <><Upload className="w-5 h-5" /><span className="px-2 text-xs text-center">Click to upload</span></>
          }
        </div>
      )}

      {/* URL + Upload button */}
      <div className="flex gap-2">
        <input type="text" value={value || ''} onChange={e => onChangeUrl(e.target.value)}
          placeholder="Paste photo URL..."
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

function PastorModal({ open, onClose, title, form, onChange, onSave, isSaving }) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="py-2 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
            <input type="text" value={form.name || ''} onChange={e => onChange('name', e.target.value)}
              placeholder="e.g. Pastor Armel Amit"
              className="w-full px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Role <span className="text-red-500">*</span></label>
            <input type="text" value={form.role || ''} onChange={e => onChange('role', e.target.value)}
              placeholder="e.g. Senior Pastor"
              className="w-full px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Photo</label>
            <PhotoField
              value={form.photo}
              crop={form.photo_crop}
              onChangeUrl={v => onChange('photo', v)}
              onChangeCrop={v => onChange('photo_crop', v)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Bio</label>
            <textarea value={form.bio || ''} onChange={e => onChange('bio', e.target.value)}
              placeholder="Pastor's biography..." rows={4}
              className="w-full px-3 py-2 text-sm border rounded-lg resize-none border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Favorite Verse</label>
            <input type="text" value={form.verse || ''} onChange={e => onChange('verse', e.target.value)}
              placeholder={`e.g. "Shepherd the flock of God..." — 1 Peter 5:2`}
              className="w-full px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
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
          <button type="button" onClick={onSave} disabled={isSaving || !form.name || !form.role}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />} Save
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function PastorsAdmin() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data = [], isLoading } = useQuery({ queryKey: ['pastors-admin'], queryFn: () => pastorsService.list() });

  const save = useMutation({
    mutationFn: () => editId ? pastorsService.update(editId, form) : pastorsService.create(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pastors-admin'] }); qc.invalidateQueries({ queryKey: ['pastors'] }); closeModal(); },
    onError: err => console.error('Save failed:', err.message),
  });

  const del = useMutation({
    mutationFn: id => pastorsService.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pastors-admin'] }); qc.invalidateQueries({ queryKey: ['pastors'] }); setDeleteTarget(null); },
  });

  const openAdd = () => { setForm({ sort_order: (data.length + 1) }); setEditId(null); setModal(true); };
  const openEdit = row => { setForm({ ...row }); setEditId(row.id); setModal(true); };
  const closeModal = () => { setModal(false); setForm({}); setEditId(null); };
  const change = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <>
      <AdminTable title="Pastors" columns={COLUMNS} data={data} isLoading={isLoading} onAdd={openAdd} onEdit={openEdit} onDelete={setDeleteTarget} />
      <PastorModal open={modal} onClose={closeModal} title={editId ? 'Edit Pastor' : 'Add Pastor'} form={form} onChange={change} onSave={() => save.mutate()} isSaving={save.isPending} />
      <DeleteConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => del.mutate(deleteTarget.id)} isDeleting={del.isPending} label={deleteTarget?.name} />
    </>
  );
}