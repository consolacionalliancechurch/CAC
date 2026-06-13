import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { siteSettingsService } from '@/services';
import { Loader2, Save, CheckCircle } from 'lucide-react';

const FIELDS = [
  {
    key: 'contact_location',
    label: 'Location',
    placeholder: 'Consolacion, Cebu\nPhilippines',
    hint: 'Each line will show separately on the card',
    multiline: true,
  },
  {
    key: 'contact_schedule',
    label: 'Service Schedule',
    placeholder: 'Sunday Worship: 9:00 AM\nPrayer Meeting: Wednesday 7:00 PM\nBible Study: Friday 7:00 PM',
    hint: 'Each line = one schedule entry',
    multiline: true,
  },
  {
    key: 'contact_phone',
    label: 'Phone / Office Info',
    placeholder: 'Contact the church office\nfor inquiries and prayer requests',
    hint: 'Phone number or office hours',
    multiline: true,
  },
  {
    key: 'contact_email',
    label: 'Email',
    placeholder: 'consolacion.alliance@email.com',
    hint: 'Church email address',
    multiline: false,
  },
  {
    key: 'contact_facebook',
    label: 'Facebook Page URL',
    placeholder: 'https://facebook.com/consolacionalliancechurch',
    hint: 'Optional — shows a Facebook link button',
    multiline: false,
  },
  {
    key: 'contact_map_embed',
    label: 'Google Maps Embed URL',
    placeholder: 'https://www.google.com/maps/embed?pb=...',
    hint: 'Optional — paste the embed URL from Google Maps → Share → Embed',
    multiline: false,
  },
];

const KEYS = FIELDS.map(f => f.key);

export default function ContactAdmin() {
  const qc = useQueryClient();
  const [form, setForm] = useState({});
  const [saved, setSaved] = useState(false);

  const { data: settings = {}, isLoading } = useQuery({
    queryKey: ['site-settings-contact'],
    queryFn: () => siteSettingsService.getMany(KEYS),
  });

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) setForm(settings);
  }, [settings]);

  const save = useMutation({
    mutationFn: async () => {
      await Promise.all(Object.entries(form).map(([k, v]) => siteSettingsService.set(k, v)));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['site-settings-contact'] });
      qc.invalidateQueries({ queryKey: ['contact-info'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
    onError: err => console.error('Save failed:', err.message),
  });

  const change = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-bold font-heading text-foreground">Contact Page Info</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Edit the information shown on the Contact page.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="border-4 rounded-full w-7 h-7 border-muted border-t-primary animate-spin" />
        </div>
      ) : (
        <div className="p-6 space-y-5 border bg-card border-border rounded-2xl">
          {FIELDS.map(({ key, label, placeholder, hint, multiline }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-sm font-medium">{label}</label>
              {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
              {multiline ? (
                <textarea
                  value={form[key] || ''}
                  onChange={e => change(key, e.target.value)}
                  placeholder={placeholder}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border rounded-lg resize-none border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              ) : (
                <input
                  type="text"
                  value={form[key] || ''}
                  onChange={e => change(key, e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 text-sm border rounded-lg border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              )}
            </div>
          ))}

          <div className="flex justify-end pt-2 border-t border-border">
            <button type="button" onClick={() => save.mutate()} disabled={save.isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50">
              {save.isPending
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                : saved
                  ? <><CheckCircle className="w-4 h-4" /> Saved!</>
                  : <><Save className="w-4 h-4" /> Save Changes</>
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
}