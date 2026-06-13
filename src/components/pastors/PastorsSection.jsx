import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { pastorsService } from '@/services';
import { BookOpen, Users } from 'lucide-react';

export default function PastorsSection() {
  const { data: pastors = [], isLoading } = useQuery({
    queryKey: ['pastors'],
    queryFn: () => pastorsService.list(),
  });

  return (
    <section className="px-6 mb-24">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <p className="text-primary uppercase tracking-[0.2em] text-xs font-semibold mb-2">Our Shepherds</p>
          <h2 className="text-3xl font-bold font-heading text-foreground">Meet Our Pastors</h2>
          <p className="max-w-xl mx-auto mt-3 text-muted-foreground">
            Faithful men called by God to guide, teach, and serve this congregation with humility and love.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            {[1, 2].map(i => <div key={i} className="h-96 bg-muted rounded-2xl animate-pulse" />)}
          </div>
        ) : pastors.length === 0 ? (
          <p className="text-center text-muted-foreground">No pastors added yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            {pastors.map((pastor, i) => (
              <motion.div key={pastor.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}>
                <div className="overflow-hidden transition-all duration-300 border bg-card border-border rounded-2xl hover:shadow-xl">
                  {/* Photo */}
                  <div className="relative flex items-center justify-center overflow-hidden h-72 bg-gradient-to-br from-primary/10 to-secondary/10">
                    {pastor.photo ? (
                      <img src={pastor.photo} alt={pastor.name} className="object-cover w-full h-full" />
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-muted-foreground/40">
                        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-muted/60">
                          <Users className="w-10 h-10" />
                        </div>
                        <p className="text-sm">Photo coming soon</p>
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-sm text-foreground text-xs font-semibold shadow">
                        <BookOpen className="w-3.5 h-3.5 text-primary" />
                        {pastor.role}
                      </span>
                    </div>
                  </div>
                  {/* Content */}
                  <div className="p-7">
                    <h3 className="mb-3 text-xl font-bold font-heading text-foreground">{pastor.name}</h3>
                    {pastor.bio && <p className="mb-5 text-sm leading-relaxed text-muted-foreground">{pastor.bio}</p>}
                    {pastor.verse && (
                      <div className="px-5 py-4 border bg-primary/5 border-primary/10 rounded-xl">
                        <p className="text-xs italic leading-relaxed text-primary/80">{pastor.verse}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}