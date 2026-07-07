import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membersService } from '@/services';
import AdminTable from './AdminTable';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Filter, X } from 'lucide-react';

const MEMBER_TYPES = [
  { value: 'youth',     label: 'Youth' },
  { value: 'men',       label: 'Men' },
  { value: 'women',     label: 'Women' },
  { value: 'young_pro', label: 'Young Pro' },
];

const MONTHS = [
  { value: 1,  label: 'January' },
  { value: 2,  label: 'February' },
  { value: 3,  label: 'March' },
  { value: 4,  label: 'April' },
  { value: 5,  label: 'May' },
  { value: 6,  label: 'June' },
  { value: 7,  label: 'July' },
  { value: 8,  label: 'August' },
  { value: 9,  label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

function monthLabel(m) {
  return MONTHS.find(x => x.value === Number(m))?.label || '';
}

function formatMonthDay(month, day, year) {
  if (!month || !day) return '—';
  return `${monthLabel(month)} ${day}${year ? ', ' + year : ''}`;
}

function memberTypeLabel(v) {
  return MEMBER_TYPES.find(t => t.value === v)?.label || v || '—';
}

const COLUMNS = [
  { key: 'full_name', label: 'Full Name' },
  { key: 'gender', label: 'Gender', render: v => v || '—' },
  { key: 'contact_number', label: 'Contact Number', render: v => v || '—' },
  { key: 'birth_month', label: 'Birthdate', render: (_v, row) => formatMonthDay(row.birth_month, row.birth_day, row.birth_year) },
  { key: 'anniversary_month', label: 'Anniversary', render: (_v, row) => formatMonthDay(row.anniversary_month, row.anniversary_day, row.anniversary_year) },
  { key: 'member_type', label: 'Member Type', render: v => (
    <span className="capitalize text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
      {memberTypeLabel(v)}
    </span>
  )},
  { key: 'status', label: 'Status', render: v => (
    <span className={`capitalize text-xs px-2 py-0.5 rounded-full ${v === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
      {v || 'active'}
    </span>
  )},
];

/* ── Small month/day/year picker used for both Birthdate and Anniversary ── */
function DateFields({ label, month, day, year, onChangeMonth, onChangeDay, onChangeYear, hint }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">
        {label} {hint && <span className="font-normal text-muted-foreground">{hint}</span>}
      </label>
      <div className="grid grid-cols-3 gap-2">
        <select value={month || ''} onChange={e => onChangeMonth(e.target.value ? Number(e.target.value) : null)}
          className="px-2 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">Month</option>
          {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        <input type="number" min="1" max="31" value={day || ''} placeholder="Day"
          onChange={e => onChangeDay(e.target.value ? Number(e.target.value) : null)}
          className="px-2 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
        <input type="number" min="1900" max="2100" value={year || ''} placeholder="Year (optional)"
          onChange={e => onChangeYear(e.target.value ? Number(e.target.value) : null)}
          className="px-2 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
    </div>
  );
}

/* ── Form Modal ── */
function MemberModal({ open, onClose, title, form, onChange, onSave, isSaving }) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="py-2 space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Full Name <span className="text-red-500">*</span></label>
            <input type="text" value={form.full_name || ''} onChange={e => onChange('full_name', e.target.value)}
              placeholder="Full name"
              className="w-full px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          {/* Gender */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Gender</label>
            <select value={form.gender || ''} onChange={e => onChange('gender', e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Select...</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          {/* Contact Number */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Contact Number <span className="font-normal text-muted-foreground">(optional)</span></label>
            <input type="text" value={form.contact_number || ''} onChange={e => onChange('contact_number', e.target.value)}
              placeholder="09XX XXX XXXX"
              className="w-full px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          {/* Birthdate */}
          <DateFields
            label="Birthdate"
            hint="(year optional)"
            month={form.birth_month} day={form.birth_day} year={form.birth_year}
            onChangeMonth={v => onChange('birth_month', v)}
            onChangeDay={v => onChange('birth_day', v)}
            onChangeYear={v => onChange('birth_year', v)}
          />

          {/* Anniversary */}
          <DateFields
            label="Anniversary"
            hint="(if married, year optional)"
            month={form.anniversary_month} day={form.anniversary_day} year={form.anniversary_year}
            onChangeMonth={v => onChange('anniversary_month', v)}
            onChangeDay={v => onChange('anniversary_day', v)}
            onChangeYear={v => onChange('anniversary_year', v)}
          />

          {/* Member Type */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Member Type</label>
            <select value={form.member_type || ''} onChange={e => onChange('member_type', e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Select...</option>
              {MEMBER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Status</label>
            <select value={form.status || 'active'} onChange={e => onChange('status', e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm font-medium transition border rounded-lg border-input hover:bg-muted">
            Cancel
          </button>
          <button type="button" onClick={onSave}
            disabled={isSaving || !form.full_name}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Filter Bar ── */
function FilterBar({ filters, onChange, onClear, hasActiveFilters }) {
  return (
    <div className="p-4 mb-4 border bg-card rounded-2xl border-border">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-semibold text-foreground">Filters</span>
        {hasActiveFilters && (
          <button onClick={onClear} className="flex items-center gap-1 ml-auto text-xs text-muted-foreground hover:text-foreground">
            <X className="w-3 h-3" /> Clear all
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-4">
        {/* Member Type */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Member Type</label>
          <select value={filters.type} onChange={e => onChange('type', e.target.value)}
            className="px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">All Types</option>
            {MEMBER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Status</label>
          <select value={filters.status} onChange={e => onChange('status', e.target.value)}
            className="px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Birthday range */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Birthday From</label>
          <div className="flex gap-1">
            <select value={filters.birthFromMonth} onChange={e => onChange('birthFromMonth', e.target.value)}
              className="px-2 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Month</option>
              {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <input type="number" min="1" max="31" placeholder="Day" value={filters.birthFromDay}
              onChange={e => onChange('birthFromDay', e.target.value)}
              className="w-16 px-2 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Birthday To</label>
          <div className="flex gap-1">
            <select value={filters.birthToMonth} onChange={e => onChange('birthToMonth', e.target.value)}
              className="px-2 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Month</option>
              {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <input type="number" min="1" max="31" placeholder="Day" value={filters.birthToDay}
              onChange={e => onChange('birthToDay', e.target.value)}
              className="w-16 px-2 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>

        {/* Anniversary range */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Anniversary From</label>
          <div className="flex gap-1">
            <select value={filters.annivFromMonth} onChange={e => onChange('annivFromMonth', e.target.value)}
              className="px-2 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Month</option>
              {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <input type="number" min="1" max="31" placeholder="Day" value={filters.annivFromDay}
              onChange={e => onChange('annivFromDay', e.target.value)}
              className="w-16 px-2 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Anniversary To</label>
          <div className="flex gap-1">
            <select value={filters.annivToMonth} onChange={e => onChange('annivToMonth', e.target.value)}
              className="px-2 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Month</option>
              {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <input type="number" min="1" max="31" placeholder="Day" value={filters.annivToDay}
              onChange={e => onChange('annivToDay', e.target.value)}
              className="w-16 px-2 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
      </div>
    </div>
  );
}

const EMPTY_FILTERS = {
  type: '', status: '',
  birthFromMonth: '', birthFromDay: '', birthToMonth: '', birthToDay: '',
  annivFromMonth: '', annivFromDay: '', annivToMonth: '', annivToDay: '',
};

/* ── Main ── */
export default function MembersAdmin() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ status: 'active' });
  const [editId, setEditId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const { data = [], isLoading } = useQuery({
    queryKey: ['members-admin'],
    queryFn: () => membersService.list(),
  });

  const save = useMutation({
    mutationFn: () => editId
      ? membersService.update(editId, form)
      : membersService.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members-admin'] });
      closeModal();
    },
    onError: (err) => console.error('Save failed:', err.message),
  });

  const del = useMutation({
    mutationFn: id => membersService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members-admin'] });
      setDeleteTarget(null);
    },
  });

  const openAdd = () => { setForm({ status: 'active' }); setEditId(null); setModal(true); };
  const openEdit = row => { setForm({ ...row }); setEditId(row.id); setModal(true); };
  const closeModal = () => { setModal(false); setForm({ status: 'active' }); setEditId(null); };
  const change = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const changeFilter = (k, v) => setFilters(f => ({ ...f, [k]: v }));
  const clearFilters = () => setFilters(EMPTY_FILTERS);
  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  const filteredData = useMemo(() => {
    let rows = data;

    if (filters.type) {
      rows = rows.filter(r => r.member_type === filters.type);
    }

    if (filters.status) {
      rows = rows.filter(r => (r.status || 'active') === filters.status);
    }

    // Birthday range (month+day only, year ignored)
    const bFromMonth = filters.birthFromMonth ? Number(filters.birthFromMonth) : null;
    const bFromDay = filters.birthFromDay ? Number(filters.birthFromDay) : null;
    const bToMonth = filters.birthToMonth ? Number(filters.birthToMonth) : null;
    const bToDay = filters.birthToDay ? Number(filters.birthToDay) : null;

    if (bFromMonth && bFromDay && bToMonth && bToDay) {
      const fromKey = bFromMonth * 100 + bFromDay;
      const toKey = bToMonth * 100 + bToDay;
      rows = rows.filter(r => {
        if (!r.birth_month || !r.birth_day) return false;
        const key = r.birth_month * 100 + r.birth_day;
        return fromKey <= toKey
          ? (key >= fromKey && key <= toKey)
          : (key >= fromKey || key <= toKey); // wraps across year-end (e.g. Dec 28 - Jan 5)
      });
    }

    // Anniversary range (month+day only, year ignored)
    const aFromMonth = filters.annivFromMonth ? Number(filters.annivFromMonth) : null;
    const aFromDay = filters.annivFromDay ? Number(filters.annivFromDay) : null;
    const aToMonth = filters.annivToMonth ? Number(filters.annivToMonth) : null;
    const aToDay = filters.annivToDay ? Number(filters.annivToDay) : null;

    if (aFromMonth && aFromDay && aToMonth && aToDay) {
      const fromKey = aFromMonth * 100 + aFromDay;
      const toKey = aToMonth * 100 + aToDay;
      rows = rows.filter(r => {
        if (!r.anniversary_month || !r.anniversary_day) return false;
        const key = r.anniversary_month * 100 + r.anniversary_day;
        return fromKey <= toKey
          ? (key >= fromKey && key <= toKey)
          : (key >= fromKey || key <= toKey); // wraps across year-end
      });
    }

    return rows;
  }, [data, filters]);

  return (
    <>
      <FilterBar filters={filters} onChange={changeFilter} onClear={clearFilters} hasActiveFilters={hasActiveFilters} />

      <AdminTable title={`Members (${filteredData.length})`} columns={COLUMNS} data={filteredData} isLoading={isLoading}
        onAdd={openAdd} onEdit={openEdit} onDelete={setDeleteTarget} />

      <MemberModal
        open={modal}
        onClose={closeModal}
        title={editId ? 'Edit Member' : 'Add Member'}
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
        label={deleteTarget?.full_name}
      />
    </>
  );
}