import React from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus } from 'lucide-react';

export default function AdminTable({ title, columns, data, onAdd, onEdit, onDelete, isLoading }) {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h2 className="font-heading text-lg font-bold text-foreground">{title}</h2>
        <Button onClick={onAdd} size="sm" className="gap-2">
          <Plus className="w-4 h-4" /> Add New
        </Button>
      </div>

      {isLoading ? (
        <div className="p-8 space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />)}
        </div>
      ) : data.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground">
          <p>No records yet. Click "Add New" to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {columns.map(col => (
                  <th key={col.key} className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {col.label}
                  </th>
                ))}
                <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={row.id || i} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  {columns.map(col => (
                    <td key={col.key} className="px-6 py-4 text-foreground">
                      {col.render ? col.render(row[col.key], row) : (row[col.key] || '—')}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(row)} className="h-8 w-8">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(row)} className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}