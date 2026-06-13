import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { siteSettingsService } from '@/services';
import { uploadFile } from '@/lib/uploadFile';
import { Upload, Loader2, X, Save, CheckCircle } from 'lucide-react';

function ImageSettingField({ label, hint, value, onChange }) {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file, 'about');
      onChange(url);
    } finally { setUploading(false); e.target.value = ''; }
  };

  return (
    <div className="space-y-2">
      <div>
        <label className="text-sm font-medium">{label}</label>
        {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
      </div>
      {value ? (
        <div className="relative w-full overflow-hidden border h-44 rounded-xl border-border">
          <img src={value} alt="" className="object-cover w-full h-full" />
          <button type="button" onClick={() => onChange('')}
            className="absolute flex items-center justify-center w-6 h-6 text-white transition rounded-full top-2 right-2 bg-black/60 hover:bg-red-500">
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div onClick={() => inputRef.current?.click()}
          className="flex items-center justify-center w-full h-24 gap-2 transition border-2 border-dashed cursor-pointer rounded-xl border-border hover:border-primary/50 text-muted-foreground hover:text-primary bg-muted/20">
          {uploading
            ? <><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Uploading...</span></>
            : <><Upload className="w-5 h-5" /><span className="text-sm">Click to upload photo</span></>}
        </div>
      )}
      <div className="flex gap-2">
        <input type="text" value={value || ''} onChange={e => onChange(e.target.value)}
          placeholder="Or paste image URL..."
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

export default function AboutSettingsAdmin() {
  const qc = useQueryClient();
  const [heroImage, setHeroImage] = useState('');
  const [fellowshipImage, setFellowshipImage] = useState('');
  const [saved, setSaved] = useState(false);

  const { data: settings = {}, isLoading } = useQuery({
    queryKey: ['site-settings-about'],
    queryFn: () => siteSettingsService.getMany(['about_hero_image', 'about_fellowship_image']),
  });

  // Populate fields once loaded
  useEffect(() => {
    if (settings.about_hero_image !== undefined) setHeroImage(settings.about_hero_image || '');
    if (settings.about_fellowship_image !== undefined) setFellowshipImage(settings.about_fellowship_image || '');
  }, [settings]);

  const save = useMutation({
    mutationFn: async () => {
      // Always save both keys explicitly
      await siteSettingsService.set('about_hero_image', heroImage);
      await siteSettingsService.set('about_fellowship_image', fellowshipImage);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['site-settings-about'] });
      qc.invalidateQueries({ queryKey: ['about-images'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
    onError: err => console.error('Save failed:', err.message),
  });

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-lg font-bold font-heading text-foreground">About Page Images</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Upload or paste URLs for the photos shown on the About page.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="border-4 rounded-full w-7 h-7 border-muted border-t-primary animate-spin" />
        </div>
      ) : (
        <div className="p-6 space-y-8 border bg-card border-border rounded-2xl">
          <ImageSettingField
            label="Hero / Banner Image"
            hint='Full-width photo behind "Our Story" at the top of the About page'
            value={heroImage}
            onChange={setHeroImage}
          />

          <div className="border-t border-border" />

          <ImageSettingField
            label="Fellowship Image"
            hint="Wide photo shown at the bottom of the About page"
            value={fellowshipImage}
            onChange={setFellowshipImage}
          />

          <div className="flex justify-end pt-2">
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