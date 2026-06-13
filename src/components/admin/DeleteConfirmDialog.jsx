import React from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';

export default function DeleteConfirmDialog({ open, onClose, onConfirm, isDeleting, label }) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this record?</AlertDialogTitle>
          <AlertDialogDescription>
            {label ? `"${label}" will be permanently deleted.` : 'This record will be permanently deleted.'} This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2">
            {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}