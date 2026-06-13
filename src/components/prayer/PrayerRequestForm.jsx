import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { prayerRequestsService } from '@/services';
import { Send, HandHeart } from 'lucide-react';

const CATEGORIES = ['healing','family','guidance','thanksgiving','financial','spiritual_growth','missions','other'];

export default function PrayerRequestForm() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: '', request: '', category: 'other', is_anonymous: false, is_urgent: false
  });
  const [submitted, setSubmitted] = useState(false);

  const submit = useMutation({
    mutationFn: () => prayerRequestsService.submit({
      name: form.is_anonymous ? null : form.name,
      request: form.request,
      category: form.category,
      is_anonymous: form.is_anonymous,
      is_urgent: form.is_urgent,
      status: 'pending',
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['prayer-requests-public'] });
      setSubmitted(true);
      setForm({ name: '', request: '', category: 'other', is_anonymous: false, is_urgent: false });
    },
    onError: (err) => console.error('Submit failed:', err.message),
  });

  const change = (k, v) => setForm(f => ({ ...f, [k]: v }));

  if (submitted) {
    return (
      <div className="p-8 text-center border border-green-200 bg-green-50 rounded-2xl">
        <HandHeart className="w-12 h-12 mx-auto mb-3 text-green-500" />
        <h3 className="mb-1 text-xl font-bold text-green-800 font-heading">Prayer Request Received</h3>
        <p className="text-sm text-green-700">We will be praying for you. God hears every prayer.</p>
        <button onClick={() => setSubmitted(false)} className="mt-4 text-sm text-green-600 underline">
          Submit another
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 border bg-card border-border rounded-2xl">
      <h2 className="mb-4 text-lg font-bold font-heading">Submit a Prayer Request</h2>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="anon"
            checked={form.is_anonymous}
            onChange={e => change('is_anonymous', e.target.checked)}
            className="rounded"
          />
          <label htmlFor="anon" className="text-sm text-muted-foreground">Keep my name anonymous</label>
        </div>

        {!form.is_anonymous && (
          <input
            type="text"
            placeholder="Your name"
            value={form.name}
            onChange={e => change('name', e.target.value)}
            className="w-full px-3 py-2 text-sm border rounded-lg border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        )}

        <select
          value={form.category}
          onChange={e => change('category', e.target.value)}
          className="w-full px-3 py-2 text-sm border rounded-lg border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {CATEGORIES.map(c => (
            <option key={c} value={c} className="capitalize">{c.replace('_', ' ')}</option>
          ))}
        </select>

        <textarea
          placeholder="Share your prayer request..."
          value={form.request}
          onChange={e => change('request', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 text-sm border rounded-lg resize-none border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="urgent"
            checked={form.is_urgent}
            onChange={e => change('is_urgent', e.target.checked)}
            className="rounded"
          />
          <label htmlFor="urgent" className="text-sm text-muted-foreground">This is urgent</label>
        </div>

        <button
          onClick={() => submit.mutate()}
          disabled={!form.request || submit.isPending}
          className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          {submit.isPending ? 'Submitting...' : 'Submit Prayer Request'}
        </button>
      </div>
    </div>
  );
}