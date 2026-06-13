import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Church, Facebook } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { siteSettingsService } from '@/services';

const KEYS = ['contact_location','contact_schedule','contact_phone','contact_email','contact_facebook','contact_map_embed'];

const DEFAULTS = {
  contact_location: 'Consolacion, Cebu\nPhilippines',
  contact_schedule: 'Sunday Worship: 9:00 AM\nPrayer Meeting: Wednesday 7:00 PM\nBible Study: Friday 7:00 PM',
  contact_phone: 'Contact the church office\nfor inquiries and prayer requests',
  contact_email: 'consolacion.alliance@email.com',
  contact_facebook: '',
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

        {/* Facebook link */}
        {get('contact_facebook') && (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="flex justify-center mb-10">
            <a href={get('contact_facebook')} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1877F2] text-white text-sm font-medium hover:opacity-90 transition">
              <Facebook className="w-4 h-4" /> Follow us on Facebook
            </a>
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