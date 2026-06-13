import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { orgChartService } from '@/services';
import { User } from 'lucide-react';

function OrgNode({ name, role, photo, highlight = false, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay }}
      className="flex flex-col items-center gap-2 min-w-[120px]">
      <div className={`w-16 h-16 rounded-full overflow-hidden border-2 flex items-center justify-center shrink-0
        ${highlight ? 'border-primary' : 'border-border'}
        ${!photo ? (highlight ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground') : ''}`}>
        {photo ? <img src={photo} alt={name} className="object-cover w-full h-full" /> : <User className="w-6 h-6" />}
      </div>
      <div className="text-center">
        <p className={`font-heading font-bold text-sm leading-tight ${highlight ? 'text-primary' : 'text-foreground'}`}>{name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{role}</p>
      </div>
    </motion.div>
  );
}

export default function OrgChart() {
  const { data: members = [], isLoading } = useQuery({
    queryKey: ['org-chart'],
    queryFn: () => orgChartService.list(),
  });

  const head = members.find(m => m.level === 1);
  const level2 = members.filter(m => m.level === 2);
  const ministries = members.filter(m => m.level === 3);

  return (
    <section className="px-6 mb-24">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <p className="text-primary uppercase tracking-[0.2em] text-xs font-semibold mb-2">Leadership Structure</p>
          <h2 className="text-3xl font-bold font-heading text-foreground">Church Organization</h2>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 rounded-full border-muted border-t-primary animate-spin" />
          </div>
        ) : members.length === 0 ? (
          <p className="text-center text-muted-foreground">No org chart members added yet.</p>
        ) : (
          <div className="pb-4 overflow-x-auto">
            <div className="min-w-[640px]">

              {/* Level 1 — Head */}
              {head && (
                <>
                  <div className="flex justify-center mb-6">
                    <OrgNode name={head.name} role={head.role} photo={head.photo} highlight delay={0} />
                  </div>
                  <div className="flex justify-center mb-0">
                    <div className="w-px h-8 bg-border" />
                  </div>
                </>
              )}

              {/* Level 2 */}
              {level2.length > 0 && (
                <>
                  <div className="relative flex justify-center gap-6 mb-10 sm:gap-10">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[calc(100%-80px)] border-t border-border -mt-0 hidden sm:block" />
                    {level2.map((node, i) => (
                      <div key={node.id} className="flex flex-col items-center">
                        <div className="w-px h-6 mb-2 bg-border" />
                        <OrgNode name={node.name} role={node.role} photo={node.photo} delay={0.1 + i * 0.07} />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center mb-0">
                    <div className="w-px h-8 bg-border" />
                  </div>
                </>
              )}

              {/* Level 3 — Ministries */}
              {ministries.length > 0 && (
                <>
                  <div className="flex justify-center mb-4">
                    <span className="px-4 py-1 text-xs tracking-widest uppercase border rounded-full text-muted-foreground border-border bg-background">
                      Ministry Leaders
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-6 mt-2 sm:grid-cols-3 lg:grid-cols-6">
                    {ministries.map((node, i) => (
                      <OrgNode key={node.id} name={node.name} role={node.role} photo={node.photo} delay={0.2 + i * 0.06} />
                    ))}
                  </div>
                </>
              )}

            </div>
          </div>
        )}
      </div>
    </section>
  );
}