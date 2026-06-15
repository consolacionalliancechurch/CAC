import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabaseClient';
import { uploadFile } from '@/lib/uploadFile';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, Loader2, X, FileText, CheckCircle, Play, ExternalLink } from 'lucide-react';

const COLUMNS_KEYS = ['date', 'topic_title', 'speaker_name', 'video_url', 'slides_pdf'];

// Fetch sunday services as sermon records
async function fetchSermonRecords() {
  const { data, error } = await supabase
    .from('sunday_services')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return data;
}

async function updateSermonRecord(id, fields) {
  const ALLOWED = ['video_url', 'slides_pdf', 'topic_description', 'scripture_reference'];
  const clean = Object.fromEntries(Object.entries(fields).filter(([k]) => ALLOWED.includes(k)));
  const { data, error } = await supabase
    .from('sunday_services')
    .update(clean)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ── PDF upload field ── */
function PdfField({ value, onChange }) {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file, 'sermons/slides');
      onChange(url);
    } finally { setUploading(false); e.target.value = ''; }
  };

  const filename = value
    ? decodeURIComponent(value.split('/').pop().split('?')[0]).replace(/^\d+-[a-z0-9]+\./, '')
    : '';

  return (
    <div className="space-y-2">
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
            className="flex items-center justify-center transition rounded-full w-7 h-7 hover:bg-muted text-muted-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div onClick={() => inputRef.current?.click()}
          className="flex items-center justify-center w-full h-16 gap-2 transition border-2 border-dashed cursor-pointer rounded-xl border-border hover:border-primary/50 text-muted-foreground hover:text-primary bg-muted/20">
          {uploading
            ? <><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Uploading...</span></>
            : <><FileText className="w-4 h-4" /><span className="text-sm">Click to upload PDF slides</span></>}
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

/* ── Edit modal — only video + PDF ── */
function EditSermonModal({ open, onClose, record, onSave, isSaving }) {
  const [form, setForm] = useState({});

  React.useEffect(() => {
    if (record) setForm({
      video_url: record.video_url || '',
      slides_pdf: record.slides_pdf || '',
      topic_description: record.topic_description || '',
      scripture_reference: record.scripture_reference || '',
    });
  }, [record, open]);

  const change = (k, v) => setForm(f => ({ ...f, [k]: v }));

  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Sermon Media</DialogTitle>
        </DialogHeader>

        {/* Read-only service info */}
        <div className="p-4 space-y-1 border bg-muted/40 rounded-xl border-border">
          <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">Sunday Service</p>
          <p className="font-bold font-heading text-foreground">{record.topic_title || 'Untitled'}</p>
          <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
            {record.date && <span>{format(new Date(record.date), 'MMMM d, yyyy')}</span>}
            {record.speaker_name && <span>· {record.speaker_name}</span>}
          </div>
        </div>

        <div className="py-2 space-y-5">
          {/* Scripture reference */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Scripture Reference</label>
            <input type="text" value={form.scripture_reference || ''} onChange={e => change('scripture_reference', e.target.value)}
              placeholder="e.g. John 3:16"
              className="w-full px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Sermon Description</label>
            <textarea value={form.topic_description || ''} onChange={e => change('topic_description', e.target.value)}
              placeholder="Brief summary of the message..." rows={3}
              className="w-full px-3 py-2 text-sm border rounded-lg resize-none border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          {/* Video URL */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Play className="w-4 h-4 text-primary" /> Video Link (YouTube / Facebook)
            </label>
            <div className="flex gap-2">
              <input type="text" value={form.video_url || ''} onChange={e => change('video_url', e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="flex-1 px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
              {form.video_url && (
                <a href={form.video_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center px-3 py-2 border rounded-lg border-input bg-muted hover:bg-muted/80">
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* PDF slides */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium">
              <FileText className="w-4 h-4 text-primary" /> Sermon Slides (PDF)
            </label>
            <PdfField value={form.slides_pdf} onChange={v => change('slides_pdf', v)} />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm font-medium transition border rounded-lg border-input hover:bg-muted">
            Cancel
          </button>
          <button type="button" onClick={() => onSave(form)} disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />} Save
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function SermonsAdmin() {
  const qc = useQueryClient();
  const [editRecord, setEditRecord] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ['sermon-records'],
    queryFn: fetchSermonRecords,
  });

  const save = useMutation({
    mutationFn: (form) => updateSermonRecord(editRecord.id, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sermon-records'] });
      qc.invalidateQueries({ queryKey: ['sermons'] });
      setEditRecord(null);
    },
    onError: err => console.error('Save failed:', err.message),
  });

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold font-heading text-foreground">Sermons</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Sunday service records pulled from Sunday Services. Click edit to add video link and PDF slides.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="border-4 rounded-full w-7 h-7 border-muted border-t-primary animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="py-10 text-sm text-center text-muted-foreground">
            No Sunday Services found. Add them in the Sunday Service tab first.
          </div>
        ) : (
          <div className="overflow-hidden border border-border rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left uppercase text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left uppercase text-muted-foreground">Sermon Title</th>
                  <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left uppercase text-muted-foreground">Speaker</th>
                  <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left uppercase text-muted-foreground">Media</th>
                  <th className="px-4 py-3 text-xs font-semibold tracking-wider text-right uppercase text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.map(record => (
                  <tr key={record.id} className="transition-colors hover:bg-muted/20">
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {record.date ? format(new Date(record.date), 'MMM d, yyyy') : '—'}
                    </td>
                    <td className="max-w-xs px-4 py-3 font-medium text-foreground">
                      <p className="truncate">{record.topic_title || '—'}</p>
                      {record.scripture_reference && (
                        <p className="text-xs truncate text-primary">{record.scripture_reference}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{record.speaker_name || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {record.video_url ? (
                          <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            <Play className="w-3 h-3" /> Video
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">No video</span>
                        )}
                        {record.slides_pdf && (
                          <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                            <FileText className="w-3 h-3" /> PDF
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setEditRecord(record)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition">
                        Edit Media
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EditSermonModal
        open={!!editRecord}
        onClose={() => setEditRecord(null)}
        record={editRecord}
        onSave={(form) => save.mutate(form)}
        isSaving={save.isPending}
      />
    </>
  );
}