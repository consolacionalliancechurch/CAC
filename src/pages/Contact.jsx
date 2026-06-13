import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Church, Facebook } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const contactInfo = [
  {
    icon: MapPin,
    title: 'Location',
    lines: ['Consolacion, Cebu', 'Philippines'],
  },
  {
    icon: Clock,
    title: 'Service Schedule',
    lines: ['Sunday Worship: 9:00 AM', 'Prayer Meeting: Wednesday 7:00 PM', 'Bible Study: Friday 7:00 PM'],
  },
  {
    icon: Phone,
    title: 'Phone',
    lines: ['Contact the church office', 'for inquiries and prayer requests'],
  },
  {
    icon: Mail,
    title: 'Email',
    lines: ['consolacion.alliance@email.com'],
  },
];

export default function Contact() {
  return (
    <div className="min-h-screen pt-28 pb-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <p className="text-primary uppercase tracking-[0.2em] text-xs font-semibold mb-2">Get In Touch</p>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-4">Contact Us</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            We'd love to hear from you. Whether you have questions, need prayer, or want to visit — you're always welcome.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {contactInfo.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-foreground mb-2">{item.title}</h3>
                      {item.lines.map((line, j) => (
                        <p key={j} className="text-sm text-muted-foreground leading-relaxed">{line}</p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Map placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-muted h-80 flex flex-col items-center justify-center text-center px-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Church className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-heading text-xl font-bold text-foreground mb-2">Consolacion Alliance Church</h3>
                <p className="text-muted-foreground text-sm">Consolacion, Cebu, Philippines</p>
                <p className="text-muted-foreground text-sm mt-1">Under CAMACOP — Christian and Missionary Alliance Churches of the Philippines</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-primary/5 rounded-2xl p-12 border border-primary/10">
            <h2 className="font-heading text-2xl font-bold text-foreground mb-3">You're Always Welcome</h2>
            <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Whether you're a first-time visitor or looking for a church home, we invite you to join us this Sunday. 
              Come as you are — you'll find a warm, welcoming community ready to walk with you in faith.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}