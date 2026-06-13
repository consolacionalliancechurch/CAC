import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orgChartService } from '@/services';
import { uploadFile } from '@/lib/uploadFile';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, Loader2, X, Plus, Pencil, Trash2, User } from 'lucide-react';

// Default position slots — admin can fill these in or add custom ones
const DEFAULT_SLOTS = [
  // level, default role label
  { level: 1, role: 'Senior Pastor' },
  { level: 2, role: 'Board Chairman' },
  { level: 2, role: 'Church Secretary' },
  { level: 2, role: 'Church Treasurer' },
  { level: 3, role: 'Worship Ministry' },
  { level: 3, role: 'Youth Ministry' },
  { level: 3, role: "Women's Ministry" },
  { level: 3, role: "Men's Ministry" },
  { level: 3, role: "Children's Ministry" },
  { level: 3, role: 'Outreach & Missions' },
];

const LEVEL_LABELS = {
  1: 'Senior Leadership',
  2: 'Board & Officers',
  3: 'Ministry Leaders',
};

function PhotoField({ value, onChange }) {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try { onChange(await uploadFile(file, 'org-chart')); }
    finally { setUploading(false); e.target.value = ''; }
  };
  return (
    <div className="space-y-2">
      {value && (
        <div className="relative w-20 h-20 mx-auto overflow-hidden border-2 rounded-full border-border">
          <img src={value} alt="" className="object-cover w-full h-full" />
          <button type="button" onClick={() => onChange('')}
            className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-white rounded-full bg-black/60 hover:bg-red-500">
            <X className="w-3 h-3" />
          </button>
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

// Person assignment modal
function AssignModal({ open, onClose, slot, person, onSave, onDelete, isSaving, isDeleting }) {
  const [form, setForm] = useState({ name: '', photo: '', ...person });
  const change = (k, v) => setForm(f => ({ ...f, [k]: v }));

  React.useEffect(() => {
    setForm({ name: '', photo: '', ...person });
  }, [person, open]);

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {person ? 'Edit Person' : 'Assign Person'} — <span className="text-primary">{slot?.role}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="py-2 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Full Name <span className="text-red-500">*</span></label>
            <input type="text" value={form.name || ''} onChange={e => change('name', e.target.value)}
              placeholder="e.g. Pastor Armel Amit"
              className="w-full px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Photo</label>
            <PhotoField value={form.photo} onChange={v => change('photo', v)} />
          </div>
        </div>
        <div className="flex justify-between pt-2 border-t border-border">
          <div>
            {person && (
              <button type="button" onClick={onDelete} disabled={isDeleting}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition">
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Remove
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-medium transition border rounded-lg border-input hover:bg-muted">Cancel</button>
            <button type="button" onClick={() => onSave(form)} disabled={isSaving || !form.name}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />} Save
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Add custom slot modal
function AddSlotModal({ open, onClose, onAdd }) {
  const [role, setRole] = useState('');
  const [level, setLevel] = useState(3);
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Add New Position</DialogTitle></DialogHeader>
        <div className="py-2 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Position / Role <span className="text-red-500">*</span></label>
            <input type="text" value={role} onChange={e => setRole(e.target.value)}
              placeholder="e.g. Finance Officer"
              className="w-full px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Level</label>
            <select value={level} onChange={e => setLevel(parseInt(e.target.value))}
              className="w-full px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
              <option value={1}>Level 1 — Senior Leadership</option>
              <option value={2}>Level 2 — Board & Officers</option>
              <option value={3}>Level 3 — Ministry Leaders</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm font-medium transition border rounded-lg border-input hover:bg-muted">Cancel</button>
          <button type="button" onClick={() => { if (role.trim()) { onAdd({ role: role.trim(), level }); onClose(); setRole(''); } }}
            disabled={!role.trim()}
            className="px-4 py-2 text-sm font-medium transition rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            Add Position
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Visual position slot card
function SlotCard({ slot, person, onClick, onDeleteSlot }) {
  const filled = !!person;
  return (
    <div className="relative group">
      <button
        type="button"
        onClick={onClick}
        className={`w-full flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all
          ${filled
            ? 'border-border bg-card hover:border-primary/50 hover:shadow-md'
            : 'border-dashed border-border bg-muted/20 hover:border-primary/50 hover:bg-primary/5'
          }`}
      >
        {/* Avatar */}
        <div className={`w-14 h-14 rounded-full overflow-hidden border-2 flex items-center justify-center
          ${filled ? 'border-primary/30' : 'border-border bg-muted'}`}>
          {filled && person.photo
            ? <img src={person.photo} alt={person.name} className="object-cover w-full h-full" />
            : filled
              ? <User className="w-6 h-6 text-muted-foreground" />
              : <Plus className="w-5 h-5 text-muted-foreground/50" />
          }
        </div>
        {/* Name / role */}
        <div className="text-center">
          <p className={`text-xs font-bold leading-tight ${filled ? 'text-foreground' : 'text-muted-foreground/50'}`}>
            {filled ? person.name : 'Click to assign'}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{slot.role}</p>
        </div>
        {/* Edit icon when filled */}
        {filled && (
          <div className="absolute flex items-center justify-center w-5 h-5 transition rounded-full opacity-0 top-2 right-2 bg-primary/10 text-primary group-hover:opacity-100">
            <Pencil className="w-3 h-3" />
          </div>
        )}
      </button>
      {/* Delete slot button */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onDeleteSlot(); }}
        className="absolute flex items-center justify-center w-5 h-5 text-red-500 transition bg-red-100 rounded-full shadow-sm opacity-0 -top-2 -left-2 hover:bg-red-500 hover:text-white group-hover:opacity-100"
        title="Remove this position"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

export default function OrgChartAdmin() {
  const qc = useQueryClient();

  // Local slot definitions (positions), persisted to localStorage
  const [slots, setSlots] = useState(() => {
    try {
      const saved = localStorage.getItem('cac_org_slots');
      return saved ? JSON.parse(saved) : DEFAULT_SLOTS;
    } catch { return DEFAULT_SLOTS; }
  });

  const [assignModal, setAssignModal] = useState(null); // { slot, person }
  const [addSlotOpen, setAddSlotOpen] = useState(false);

  const saveSlots = (newSlots) => {
    setSlots(newSlots);
    localStorage.setItem('cac_org_slots', JSON.stringify(newSlots));
  };

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['org-chart-admin'],
    queryFn: () => orgChartService.list(),
  });

  // Find person assigned to a slot (matched by role)
  const getPersonForSlot = (slot) => members.find(m => m.role === slot.role && m.level === slot.level);

  const save = useMutation({
    mutationFn: ({ person, form, slot }) => {
      const payload = { name: form.name, photo: form.photo || '', role: slot.role, level: slot.level, sort_order: slots.findIndex(s => s.role === slot.role && s.level === slot.level) };
      return person ? orgChartService.update(person.id, payload) : orgChartService.create(payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['org-chart-admin'] }); qc.invalidateQueries({ queryKey: ['org-chart'] }); setAssignModal(null); },
    onError: err => console.error('Save failed:', err.message),
  });

  const del = useMutation({
    mutationFn: id => orgChartService.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['org-chart-admin'] }); qc.invalidateQueries({ queryKey: ['org-chart'] }); setAssignModal(null); },
  });

  const grouped = [1, 2, 3].map(level => ({
    level,
    label: LEVEL_LABELS[level],
    slots: slots.filter(s => s.level === level),
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold font-heading text-foreground">Church Organization Chart</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Click any position slot to assign or edit a person</p>
        </div>
        <button onClick={() => setAddSlotOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4" /> Add Position
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="border-4 rounded-full w-7 h-7 border-muted border-t-primary animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(({ level, label, slots: levelSlots }) => (
            <div key={level}>
              {/* Level header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-border" />
                <span className={`text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full border border-border
                  ${level === 1 ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground'}`}>
                  {label}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Slot grid */}
              <div className={`grid gap-4
                ${level === 1 ? 'grid-cols-1 max-w-[160px] mx-auto' : ''}
                ${level === 2 ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : ''}
                ${level === 3 ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6' : ''}
              `}>
                {levelSlots.map((slot, i) => (
                  <SlotCard
                    key={`${level}-${slot.role}-${i}`}
                    slot={slot}
                    person={getPersonForSlot(slot)}
                    onClick={() => setAssignModal({ slot, person: getPersonForSlot(slot) })}
                    onDeleteSlot={() => {
                      const person = getPersonForSlot(slot);
                      if (person) del.mutate(person.id);
                      saveSlots(slots.filter((s, idx) => !(s.level === slot.level && s.role === slot.role)));
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assign person modal */}
      {assignModal && (
        <AssignModal
          open={!!assignModal}
          onClose={() => setAssignModal(null)}
          slot={assignModal.slot}
          person={assignModal.person}
          onSave={(form) => save.mutate({ person: assignModal.person, form, slot: assignModal.slot })}
          onDelete={() => del.mutate(assignModal.person.id)}
          isSaving={save.isPending}
          isDeleting={del.isPending}
        />
      )}

      {/* Add slot modal */}
      <AddSlotModal
        open={addSlotOpen}
        onClose={() => setAddSlotOpen(false)}
        onAdd={(newSlot) => saveSlots([...slots, newSlot])}
      />
    </div>
  );
}