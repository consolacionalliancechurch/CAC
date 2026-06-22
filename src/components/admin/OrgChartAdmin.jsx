import React, { useState, useRef, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orgChartService } from '@/services';
import { uploadFile } from '@/lib/uploadFile';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Upload, Loader2, X, Plus, Pencil, Trash2, User, ChevronDown, ChevronRight,
  GripVertical, AlertTriangle,
} from 'lucide-react';

/* ───────────────────────── Photo field (draggable + live preview) ───────────────────────── */
function PhotoField({ value, crop, onChangeUrl, onChangeCrop }) {
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
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    setUploading(true);
    try {
      const url = await uploadFile(file, 'org-chart');
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
    const s = 0.3;
    onChangeCrop({
      ...pos,
      x: Math.max(0, Math.min(100, drag.current.startObjX - (e.clientX - drag.current.startX) * s)),
      y: Math.max(0, Math.min(100, drag.current.startObjY - (e.clientY - drag.current.startY) * s)),
    });
  };
  const handleMouseUp = () => { drag.current.active = false; setIsDragging(false); };

  return (
    <div className="space-y-2">
      {displayImage ? (
        <div
          className={`relative w-28 h-28 mx-auto rounded-full overflow-hidden border-2 border-border bg-muted select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
        >
          <img src={displayImage} alt="" draggable={false}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              objectPosition: `${pos.x}% ${pos.y}%`,
              transform: `scale(${pos.scale})`, transformOrigin: `${pos.x}% ${pos.y}%`,
              pointerEvents: 'none', transition: isDragging ? 'none' : 'transform 0.1s',
            }} />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            </div>
          )}
          {!uploading && value && (
            <button type="button" onClick={(e) => { e.stopPropagation(); onChangeUrl(''); onChangeCrop(null); }}
              className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 hover:bg-red-500 flex items-center justify-center text-white transition">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ) : (
        <div onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-1 mx-auto transition border-2 border-dashed rounded-full cursor-pointer w-28 h-28 border-border hover:border-primary/50 text-muted-foreground hover:text-primary bg-muted/20">
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Upload className="w-5 h-5" /><span className="text-xs">Upload</span></>}
        </div>
      )}
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

/* ───────────────────────── Add / Edit position modal ───────────────────────── */
function PositionModal({ open, onClose, title, form, onChange, onSave, isSaving, parentLabel }) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>

        {parentLabel && (
          <div className="px-3 py-2 text-xs border rounded-lg text-muted-foreground bg-muted/40 border-border">
            Reports to: <span className="font-medium text-foreground">{parentLabel}</span>
          </div>
        )}

        <div className="py-2 space-y-4">
          <PhotoField
            value={form.photo}
            crop={form.photo_crop}
            onChangeUrl={v => onChange('photo', v)}
            onChangeCrop={v => onChange('photo_crop', v)}
          />
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Person Name <span className="text-red-500">*</span></label>
            <input type="text" value={form.name || ''} onChange={e => onChange('name', e.target.value)}
              placeholder="Full name"
              className="w-full px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Position Title <span className="text-red-500">*</span></label>
            <input type="text" value={form.role || ''} onChange={e => onChange('role', e.target.value)}
              placeholder="e.g. Senior Pastor, Worship Director, Media Coordinator..."
              className="w-full px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
            <p className="text-xs text-muted-foreground">Any title — fully custom, no presets.</p>
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

/* ───────────────────────── Delete modal with 3 strategies ───────────────────────── */
function DeleteModal({ node, allNodes, onClose, onConfirm, isDeleting }) {
  const [mode, setMode] = useState('only'); // only | descendants | reassign
  const [reassignTo, setReassignTo] = useState('');

  const childCount = useMemo(
    () => allNodes.filter(n => n.parent_id === node?.id).length,
    [allNodes, node]
  );

  const candidateParents = useMemo(
    () => allNodes.filter(n => n.id !== node?.id),
    [allNodes, node]
  );

  if (!node) return null;

  return (
    <Dialog open={!!node} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> Delete Position
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          You're deleting <span className="font-semibold text-foreground">{node.name}</span> ({node.role}).
          {childCount > 0 && ` This position has ${childCount} direct subordinate${childCount !== 1 ? 's' : ''}.`}
        </p>

        {childCount > 0 ? (
          <div className="py-2 space-y-3">
            <label className="flex items-start gap-3 p-3 transition border rounded-lg cursor-pointer border-border hover:bg-muted/40">
              <input type="radio" checked={mode === 'only'} onChange={() => setMode('only')} className="mt-1" />
              <div>
                <p className="text-sm font-medium">Delete only this position</p>
                <p className="text-xs text-muted-foreground">Subordinates move up to become top-level positions.</p>
              </div>
            </label>
            <label className="flex items-start gap-3 p-3 transition border rounded-lg cursor-pointer border-border hover:bg-muted/40">
              <input type="radio" checked={mode === 'descendants'} onChange={() => setMode('descendants')} className="mt-1" />
              <div>
                <p className="text-sm font-medium text-red-600">Delete position and all subordinates</p>
                <p className="text-xs text-muted-foreground">Removes this entire branch of the org chart permanently.</p>
              </div>
            </label>
            <label className="flex items-start gap-3 p-3 transition border rounded-lg cursor-pointer border-border hover:bg-muted/40">
              <input type="radio" checked={mode === 'reassign'} onChange={() => setMode('reassign')} className="mt-1" />
              <div className="flex-1">
                <p className="text-sm font-medium">Reassign subordinates to someone else</p>
                <p className="mb-2 text-xs text-muted-foreground">Pick a new parent for the direct subordinates.</p>
                {mode === 'reassign' && (
                  <select value={reassignTo} onChange={e => setReassignTo(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-lg border-input bg-background">
                    <option value="">— Top level (no parent) —</option>
                    {candidateParents.map(p => (
                      <option key={p.id} value={p.id}>{p.name} — {p.role}</option>
                    ))}
                  </select>
                )}
              </div>
            </label>
          </div>
        ) : (
          <p className="py-2 text-sm text-muted-foreground">This position has no subordinates and will be removed.</p>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <button onClick={onClose}
            className="px-4 py-2 text-sm font-medium transition border rounded-lg border-input hover:bg-muted">Cancel</button>
          <button
            onClick={() => onConfirm(mode, reassignTo)}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50">
            {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />} Delete
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ───────────────────────── Tree node (recursive, draggable) ───────────────────────── */
function TreeNode({ node, childrenMap, depth, onAddChild, onEdit, onDelete, dragState, setDragState, onDrop }) {
  const [collapsed, setCollapsed] = useState(false);
  const children = childrenMap[node.id] || [];
  const hasChildren = children.length > 0;

  const isDragging = dragState.draggingId === node.id;
  const isDropTarget = dragState.overId === node.id && dragState.draggingId !== node.id;

  return (
    <div className="relative">
      <div
        draggable
        onDragStart={(e) => { e.stopPropagation(); setDragState({ draggingId: node.id, overId: null }); }}
        onDragEnd={() => setDragState({ draggingId: null, overId: null })}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragState(d => ({ ...d, overId: node.id })); }}
        onDragLeave={(e) => { e.stopPropagation(); setDragState(d => ({ ...d, overId: d.overId === node.id ? null : d.overId })); }}
        onDrop={(e) => { e.preventDefault(); e.stopPropagation(); onDrop(dragState.draggingId, node.id); setDragState({ draggingId: null, overId: null }); }}
        className={`group flex items-center gap-3 p-3 rounded-xl border bg-card transition-all
          ${isDragging ? 'opacity-40' : ''}
          ${isDropTarget ? 'border-primary ring-2 ring-primary/30 bg-primary/5' : 'border-border hover:border-primary/30 hover:shadow-sm'}`}
        style={{ marginLeft: depth * 28 }}
      >
        {/* Drag handle */}
        <span className="transition cursor-grab text-muted-foreground/40 hover:text-muted-foreground">
          <GripVertical className="w-4 h-4" />
        </span>

        {/* Collapse toggle */}
        {hasChildren ? (
          <button onClick={() => setCollapsed(c => !c)} className="transition text-muted-foreground hover:text-foreground">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        ) : (
          <span className="w-4" />
        )}

        {/* Photo */}
        <div className="flex items-center justify-center w-10 h-10 overflow-hidden border rounded-full border-border bg-muted shrink-0">
          {node.photo
            ? <img src={node.photo} alt={node.name}
                className="object-cover w-full h-full"
                style={{ objectPosition: node.photo_crop ? `${node.photo_crop.x ?? 50}% ${node.photo_crop.y ?? 50}%` : 'center' }} />
            : <User className="w-4 h-4 text-muted-foreground" />}
        </div>

        {/* Name / role */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate text-foreground">{node.name}</p>
          <p className="text-xs truncate text-muted-foreground">{node.role}</p>
        </div>

        {/* Child count badge */}
        {hasChildren && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">
            {children.length}
          </span>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 transition opacity-0 group-hover:opacity-100 shrink-0">
          <button onClick={() => onAddChild(node)} title="Add Subordinate"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition">
            <Plus className="w-4 h-4" />
          </button>
          <button onClick={() => onEdit(node)} title="Edit"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(node)} title="Delete"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Connecting line + children */}
      {hasChildren && !collapsed && (
        <div className="relative mt-1.5 space-y-1.5">
          {children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              childrenMap={childrenMap}
              depth={depth + 1}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onDelete={onDelete}
              dragState={dragState}
              setDragState={setDragState}
              onDrop={onDrop}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── Main admin component ───────────────────────── */
export default function OrgChartAdmin() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);
  const [addParent, setAddParent] = useState(null); // node we're adding a child under
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [dragState, setDragState] = useState({ draggingId: null, overId: null });

  const { data: nodes = [], isLoading } = useQuery({
    queryKey: ['org-chart-admin'],
    queryFn: () => orgChartService.list(),
  });

  const childrenMap = useMemo(() => {
    const map = {};
    for (const n of nodes) {
      const key = n.parent_id || 'root';
      if (!map[key]) map[key] = [];
      map[key].push(n);
    }
    return map;
  }, [nodes]);

  const roots = childrenMap['root'] || [];

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['org-chart-admin'] });
    qc.invalidateQueries({ queryKey: ['org-chart'] });
  };

  const save = useMutation({
    mutationFn: () => editId
      ? orgChartService.update(editId, form)
      : orgChartService.create({ ...form, parent_id: addParent?.id || null, sort_order: nodes.length }),
    onSuccess: () => { invalidate(); closeModal(); },
    onError: err => console.error('Save failed:', err.message),
  });

  const delOnly = useMutation({ mutationFn: id => orgChartService.removeOnly(id), onSuccess: () => { invalidate(); setDeleteTarget(null); } });
  const delDescendants = useMutation({ mutationFn: id => orgChartService.removeWithDescendants(id), onSuccess: () => { invalidate(); setDeleteTarget(null); } });
  const delReassign = useMutation({
    mutationFn: ({ id, newParentId }) => orgChartService.removeAndReassign(id, newParentId || null),
    onSuccess: () => { invalidate(); setDeleteTarget(null); },
  });

  const reparent = useMutation({
    mutationFn: ({ id, newParentId }) => orgChartService.reparent(id, newParentId),
    onSuccess: () => invalidate(),
  });

  const openAdd = (parent = null) => { setForm({}); setEditId(null); setAddParent(parent); setModal(true); };
  const openEdit = node => { setForm({ ...node }); setEditId(node.id); setAddParent(null); setModal(true); };
  const closeModal = () => { setModal(false); setForm({}); setEditId(null); setAddParent(null); };
  const change = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const isDescendant = useCallback((maybeAncestorId, nodeId) => {
    // Walk up from nodeId to see if maybeAncestorId is found (prevents illegal drops)
    let current = nodes.find(n => n.id === nodeId);
    while (current?.parent_id) {
      if (current.parent_id === maybeAncestorId) return true;
      current = nodes.find(n => n.id === current.parent_id);
    }
    return false;
  }, [nodes]);

  const handleDrop = (draggedId, targetId) => {
    if (!draggedId || draggedId === targetId) return;
    // Prevent dropping a node onto its own descendant (would create a cycle)
    if (isDescendant(draggedId, targetId)) return;
    reparent.mutate({ id: draggedId, newParentId: targetId });
  };

  const confirmDelete = (mode, reassignTo) => {
    if (mode === 'only') delOnly.mutate(deleteTarget.id);
    else if (mode === 'descendants') delDescendants.mutate(deleteTarget.id);
    else if (mode === 'reassign') delReassign.mutate({ id: deleteTarget.id, newParentId: reassignTo });
  };

  const parentLabel = addParent ? `${addParent.name} — ${addParent.role}` : null;
  const isDeleting = delOnly.isPending || delDescendants.isPending || delReassign.isPending;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold font-heading text-foreground">Organizational Chart</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Drag any position onto another to reassign it. Unlimited depth — fully custom titles.
          </p>
        </div>
        <button onClick={() => openAdd(null)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4" /> Add Top-Level Position
        </button>
      </div>

      {/* Tree */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="border-4 rounded-full w-7 h-7 border-muted border-t-primary animate-spin" />
        </div>
      ) : roots.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-border rounded-2xl">
          <User className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="mb-3 font-medium text-muted-foreground">No positions yet</p>
          <button onClick={() => openAdd(null)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4" /> Add the first position
          </button>
        </div>
      ) : (
        <div
          className="space-y-1.5"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            // Dropping on the empty background area = move to top-level
            e.preventDefault();
            if (dragState.draggingId) {
              reparent.mutate({ id: dragState.draggingId, newParentId: null });
            }
            setDragState({ draggingId: null, overId: null });
          }}
        >
          {roots.map(node => (
            <TreeNode
              key={node.id}
              node={node}
              childrenMap={childrenMap}
              depth={0}
              onAddChild={openAdd}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
              dragState={dragState}
              setDragState={setDragState}
              onDrop={handleDrop}
            />
          ))}
        </div>
      )}

      {/* Add/Edit modal */}
      <PositionModal
        open={modal}
        onClose={closeModal}
        title={editId ? 'Edit Position' : (addParent ? 'Add Subordinate' : 'Add Top-Level Position')}
        form={form}
        onChange={change}
        onSave={() => save.mutate()}
        isSaving={save.isPending}
        parentLabel={parentLabel}
      />

      {/* Delete modal */}
      <DeleteModal
        node={deleteTarget}
        allNodes={nodes}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}