import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Church, Facebook, Instagram, Youtube } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { siteSettingsService } from '@/services';

const KEYS = ['contact_location','contact_schedule','contact_phone','contact_email','contact_facebook','contact_instagram','contact_tiktok','contact_youtube','contact_map_embed'];

const DEFAULTS = {
  contact_location: 'Consolacion, Cebu\nPhilippines',
  contact_schedule: 'Sunday Worship: 9:00 AM\nPrayer Meeting: Wednesday 7:00 PM\nBible Study: Friday 7:00 PM',
  contact_phone: 'Contact the church office\nfor inquiries and prayer requests',
  contact_email: 'consolacion.alliance@email.com',
  contact_facebook: '',
  contact_instagram: '',
  contact_tiktok: '',
  contact_youtube: '',
  contact_map_embed: '',
};

export default function Contact() {
  const { data: info = {} } = useQuery({
    queryKey: ['contact-info'],
    queryFn: () => siteSettingsService.getMany(KEYS),
  });

  const get = (key) => info[key] || DEFAULTS[key] || '';
  const lines = (key) => get(key).split('\n').filter(Boolean);

  const contactCards = [
    { icon: MapPin,  title: 'Location',         lines: lines('contact_location') },
    { icon: Clock,   title: 'Service Schedule',  lines: lines('contact_schedule') },
    { icon: Phone,   title: 'Phone',             lines: lines('contact_phone') },
    { icon: Mail,    title: 'Email',             lines: lines('contact_email') },
  ];

  return (
    <div className="min-h-screen px-6 pb-24 pt-28">
      <div className="max-w-5xl mx-auto">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16 text-center">
          <p className="text-primary uppercase tracking-[0.2em] text-xs font-semibold mb-2">Get In Touch</p>
          <h1 className="mb-4 text-4xl font-bold font-heading sm:text-5xl text-foreground">Contact Us</h1>
          <p className="max-w-xl mx-auto text-lg text-muted-foreground">
            We'd love to hear from you. Whether you have questions, need prayer, or want to visit — you're always welcome.
          </p>
        </motion.div>

        {/* Info cards */}
        <div className="grid grid-cols-1 gap-6 mb-16 md:grid-cols-2">
          {contactCards.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="h-full transition-shadow duration-300 hover:shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="mb-2 font-bold font-heading text-foreground">{item.title}</h3>
                      {item.lines.map((line, j) => (
                        <p key={j} className="text-sm leading-relaxed text-muted-foreground">{line}</p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Google Maps embed or placeholder */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {get('contact_map_embed') && get('contact_map_embed').includes('google.com/maps/embed') ? (
                <iframe
                  src={get('contact_map_embed')}
                  className="w-full border-0 h-80"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Church Location"
                />
              ) : (
                <div className="flex flex-col items-center justify-center px-6 text-center bg-muted h-80">
                  <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-primary/10">
                    <Church className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold font-heading text-foreground">Consolacion Alliance Church</h3>
                  <p className="text-sm text-muted-foreground">Consolacion, Cebu, Philippines</p>
                  <p className="mt-1 text-sm text-muted-foreground">Under CAMACOP — Christian and Missionary Alliance Churches of the Philippines</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Social links */}
        {(get('contact_facebook') || get('contact_instagram') || get('contact_tiktok') || get('contact_youtube')) && (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-3 mb-10">
            {get('contact_facebook') && (
              <a href={get('contact_facebook')} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1877F2] text-white text-sm font-medium hover:opacity-90 transition">
                <Facebook className="w-4 h-4" /> Facebook
              </a>
            )}
            {get('contact_instagram') && (
              <a href={get('contact_instagram')} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-tr from-[#FEDA75] via-[#D62976] to-[#962FBF] text-white text-sm font-medium hover:opacity-90 transition">
                <Instagram className="w-4 h-4" /> Instagram
              </a>
            )}
            {get('contact_tiktok') && (
              <a href={get('contact_tiktok')} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white transition bg-black rounded-xl hover:opacity-90">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M16.6 5.82a4.28 4.28 0 0 1-.95-2.65h-3.06v13.6a2.6 2.6 0 1 1-1.85-2.49V11.2a5.6 5.6 0 1 0 4.91 5.56V9.36a7.3 7.3 0 0 0 4.25 1.36V7.66a4.28 4.28 0 0 1-3.3-1.84Z"/>
                </svg>
                TikTok
              </a>
            )}
            {get('contact_youtube') && (
              <a href={get('contact_youtube')} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF0000] text-white text-sm font-medium hover:opacity-90 transition">
                <Youtube className="w-4 h-4" /> YouTube
              </a>
            )}
          </motion.div>
        )}

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
          <div className="p-12 border bg-primary/5 rounded-2xl border-primary/10">
            <h2 className="mb-3 text-2xl font-bold font-heading text-foreground">You're Always Welcome</h2>
            <p className="max-w-lg mx-auto leading-relaxed text-muted-foreground">
              Whether you're a first-time visitor or looking for a church home, we invite you to join us this Sunday.
              Come as you are — you'll find a warm, welcoming community ready to walk with you in faith.
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}