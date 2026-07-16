"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { AdminUserRow } from "@/server/admin/queries";

interface UserTableAlertDialogsProps {
  demoteTarget: AdminUserRow | null;
  selfDemote: boolean;
  onDemoteDialogChange: (open: boolean) => void;
  onConfirmDemote: () => void;
  bulkMode: "soft" | "hard" | null;
  bulkPending: boolean;
  selectedCount: number;
  onBulkDialogChange: (open: boolean) => void;
  onConfirmBulk: () => void;
}

export function UserTableAlertDialogs({
  demoteTarget,
  selfDemote,
  onDemoteDialogChange,
  onConfirmDemote,
  bulkMode,
  bulkPending,
  selectedCount,
  onBulkDialogChange,
  onConfirmBulk,
}: UserTableAlertDialogsProps) {
  return (
    <>
      <AlertDialog
        open={demoteTarget !== null}
        onOpenChange={onDemoteDialogChange}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selfDemote ? "Cannot Remove Your Own Admin" : "Demote User"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selfDemote
                ? "You are the last admin. Promote another user to ADMIN first before demoting yourself."
                : `This will remove admin access for "${demoteTarget?.name}". Are you sure?`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {!selfDemote && (
              <AlertDialogAction onClick={onConfirmDemote} variant="destructive">
                Demote to User
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={bulkMode !== null}
        onOpenChange={onBulkDialogChange}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkMode === "hard" ? "Delete Users" : "Unpublish Users"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkMode === "hard"
                ? `This will permanently delete ${selectedCount} user${selectedCount !== 1 ? "s" : ""} and all their data. This action cannot be undone.`
                : `This will unpublish all profiles for ${selectedCount} user${selectedCount !== 1 ? "s" : ""}.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmBulk}
              variant={bulkMode === "hard" ? "destructive" : "default"}
              disabled={bulkPending}
            >
              {bulkMode === "hard" ? "Delete" : "Unpublish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
