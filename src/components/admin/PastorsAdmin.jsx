import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pastorsService } from '@/services';
import { uploadFile } from '@/lib/uploadFile';
import AdminTable from './AdminTable';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, Loader2, X } from 'lucide-react';

const COLUMNS = [
  { key: 'photo', label: 'Photo', render: v => v
    ? <img src={v} alt="" className="object-cover w-10 h-10 border rounded-full border-border" />
    : <div className="flex items-center justify-center w-10 h-10 text-xs rounded-full bg-muted text-muted-foreground">?</div>
  },
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role' },
  { key: 'sort_order', label: 'Order' },
];

function PhotoField({ value, onChange }) {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show instant local preview before upload finishes
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);

    setUploading(true);
    try {
      const url = await uploadFile(file, 'pastors');
      onChange(url);
    } finally {
      setUploading(false);
      e.target.value = '';
      URL.revokeObjectURL(objectUrl);
      setLocalPreview(null);
    }
  };

  const displayImage = localPreview || value;

  return (
    <div className="space-y-2">
      {displayImage && (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Preview — matches how it appears on the About page</p>
          <div className="relative w-full max-w-[220px] mx-auto h-72 rounded-xl overflow-hidden border-2 border-border bg-muted">
            <img src={displayImage} alt="" className="object-cover w-full h-full" />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
            )}
            {!uploading && value && (
              <button type="button" onClick={() => onChange('')}
                className="absolute flex items-center justify-center w-6 h-6 text-white transition rounded-full top-2 right-2 bg-black/60 hover:bg-red-500">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
      <div className="flex gap-2">
        <input type="text" value={value || ''} onChange={e => onChange(e.target.value)}
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
            <PhotoField value={form.photo} onChange={v => onChange('photo', v)} />
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