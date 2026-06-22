import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { orgChartService } from '@/services';
import { User } from 'lucide-react';

/* ── Recursive node renderer ── */
function TreeNode({ node, childrenMap, depth = 0 }) {
  const children = childrenMap[node.id] || [];
  const hasChildren = children.length > 0;

  return (
    <div className="flex flex-col items-center">
      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: Math.min(depth * 0.05, 0.3) }}
        className="flex flex-col items-center gap-2 px-2"
      >
        <div className={`rounded-full overflow-hidden border-2 flex items-center justify-center shrink-0
          ${depth === 0 ? 'w-20 h-20 border-primary' : 'w-14 h-14 border-border'}
          ${!node.photo ? (depth === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground') : ''}`}>
          {node.photo
            ? <img src={node.photo} alt={node.name} className="object-cover w-full h-full"
                style={{ objectPosition: node.photo_crop ? `${node.photo_crop.x ?? 50}% ${node.photo_crop.y ?? 50}%` : 'center' }} />
            : <User className={depth === 0 ? 'w-8 h-8' : 'w-5 h-5'} />}
        </div>
        <div className="text-center max-w-[140px]">
          <p className={`font-heading font-bold leading-tight ${depth === 0 ? 'text-base text-primary' : 'text-sm text-foreground'}`}>
            {node.name}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{node.role}</p>
        </div>
      </motion.div>

      {/* Connector + children */}
      {hasChildren && (
        <div className="flex flex-col items-center mt-2">
          {/* vertical line down from parent */}
          <div className="w-px h-6 bg-border" />

          {/* horizontal line spanning children, with vertical drops */}
          <div className="relative flex items-start">
            {children.length > 1 && (
              <div className="absolute top-0 left-0 right-0 h-px bg-border"
                style={{ marginLeft: '10%', marginRight: '10%' }} />
            )}
            <div className="flex items-start gap-8">
              {children.map(child => (
                <div key={child.id} className="flex flex-col items-center">
                  <div className="w-px h-4 bg-border" />
                  <TreeNode node={child} childrenMap={childrenMap} depth={depth + 1} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrgChart() {
  const { data: nodes = [], isLoading } = useQuery({
    queryKey: ['org-chart'],
    queryFn: () => orgChartService.list(),
  });

  const childrenMap = useMemo(() => {
    const map = {};
    for (const n of nodes) {
      const key = n.parent_id || 'root';
      if (!map[key]) map[key] = [];
      map[key].push(n);
    }
    return map;
  }, [nodes]);

  const roots = childrenMap['root'] || [];

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
        ) : roots.length === 0 ? (
          <p className="text-center text-muted-foreground">No org chart members added yet.</p>
        ) : (
          <div className="pb-4 overflow-x-auto">
            <div className="flex justify-center gap-16 px-8 min-w-fit">
              {roots.map(root => (
                <TreeNode key={root.id} node={root} childrenMap={childrenMap} depth={0} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}