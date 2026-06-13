import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadFile } from '@/lib/uploadFile';

function ImageUploadField({ value, onChange, folder = 'general' }) {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const url = await uploadFile(file, folder);
      onChange(url);
    } catch (err) {
      setError('Upload failed. Try again.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {value && (
        <div className="relative w-full h-40 overflow-hidden border rounded-xl border-border">
          <img src={value} alt="preview" className="object-cover w-full h-full" />
          <button
            onClick={() => onChange('')}
            className="absolute flex items-center justify-center w-6 h-6 text-white rounded-full top-2 right-2 bg-black/60 hover:bg-black/80"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Paste image URL..."
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          className="flex-1 px-3 py-2 text-sm border rounded-lg border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-sm hover:bg-muted transition disabled:opacity-50"
        >
          {uploading
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Upload className="w-4 h-4" />
          }
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function renderField(field, value, onChange) {
  switch (field.type) {
    case 'textarea':
      return (
        <textarea
          rows={3}
          placeholder={field.placeholder}
          value={value || ''}
          onChange={e => onChange(field.key, e.target.value)}
          className="w-full px-3 py-2 text-sm border rounded-lg resize-none border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      );
    case 'date':
      return (
        <input
          type="date"
          value={value || ''}
          onChange={e => onChange(field.key, e.target.value)}
          className="w-full px-3 py-2 text-sm border rounded-lg border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      );
    case 'boolean':
      return (
        <label className="flex items-center gap-2 cursor-pointer">
          <div
            onClick={() => onChange(field.key, !value)}
            className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 cursor-pointer ${value ? 'bg-primary' : 'bg-muted'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
          <span className="text-sm text-muted-foreground">{field.placeholder || (value ? 'Yes' : 'No')}</span>
        </label>
      );
    case 'select':
      return (
        <select
          value={value || ''}
          onChange={e => onChange(field.key, e.target.value)}
          className="w-full px-3 py-2 text-sm border rounded-lg border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Select...</option>
          {field.options?.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    case 'image':
      return (
        <ImageUploadField
          value={value}
          onChange={v => onChange(field.key, v)}
          folder={field.folder || 'general'}
        />
      );
    case 'url':
      return (
        <input
          type="url"
          placeholder={field.placeholder}
          value={value || ''}
          onChange={e => onChange(field.key, e.target.value)}
          className="w-full px-3 py-2 text-sm border rounded-lg border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      );
    default:
      return (
        <input
          type="text"
          placeholder={field.placeholder}
          value={value || ''}
          onChange={e => onChange(field.key, e.target.value)}
          className="w-full px-3 py-2 text-sm border rounded-lg border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      );
  }
}

export default function AdminFormModal({ open, onClose, title, fields, data, onChange, onSave, isSaving }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading">{title}</DialogTitle>
        </DialogHeader>
        <div className="py-2 space-y-4">
          {fields.map(field => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {field.label}
                {field.required && <span className="ml-1 text-red-500">*</span>}
              </label>
              {renderField(field, data[field.key], onChange)}
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
              : 'Save'
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}