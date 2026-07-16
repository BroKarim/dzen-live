"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Trash2, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteUser, updateUserRole, bulkDeleteUsers } from "@/server/admin/actions";
import type { AdminUserRow } from "@/server/admin/queries";
import { UserAnalyticsSheet } from "@/components/admin/user-analytics-sheet";

interface UserTableProps {
  users: AdminUserRow[];
}

export function UserTable({ users }: UserTableProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUserRow | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [demoteTarget, setDemoteTarget] = useState<AdminUserRow | null>(null);
  const [selfDemote, setSelfDemote] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState<"soft" | "hard" | null>(null);
  const [bulkPending, setBulkPending] = useState(false);

  const allSelected = users.length > 0 && selectedIds.size === users.length;
  const someSelected = selectedIds.size > 0;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(users.map((u) => u.id)));
    }
  };

  const openSheet = (user: AdminUserRow) => {
    setSelectedUser(user);
    setSheetOpen(true);
  };

  const handleDelete = async (userId: string, mode: "soft" | "hard") => {
    setPendingId(userId);
    const result = await deleteUser(userId, mode);
    setPendingId(null);
    if (result.success) {
      toast.success(mode === "hard" ? "User deleted" : "User unpublished");
    } else {
      toast.error(result.error || "Failed to delete user");
    }
  };

  const handleRoleChange = async (userId: string, newRole: "USER" | "ADMIN") => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    if (user.role === "ADMIN" && newRole === "USER") {
      setDemoteTarget(user);
      return;
    }

    setPendingId(userId);
    const result = await updateUserRole(userId, newRole);
    setPendingId(null);

    if (result.success) {
      toast.success(`Role updated to ${newRole}`);
      router.refresh();
    } else if (result.blocked === "last_admin") {
      setSelfDemote(true);
      setDemoteTarget(user);
    } else {
      toast.error(result.error || "Failed to update role");
    }
  };

  const confirmDemote = async () => {
    if (!demoteTarget) return;
    setPendingId(demoteTarget.id);
    const result = await updateUserRole(demoteTarget.id, "USER");
    setPendingId(null);
    setDemoteTarget(null);
    setSelfDemote(false);

    if (result.success) {
      toast.success(`Role updated to USER`);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update role");
    }
  };

  const handleBulkDelete = async () => {
    if (!bulkMode || selectedIds.size === 0) return;
    setBulkPending(true);
    const result = await bulkDeleteUsers(Array.from(selectedIds), bulkMode);
    setBulkPending(false);
    setBulkMode(null);
    setSelectedIds(new Set());

    if (result.success) {
      toast.success(`${result.count} user${result.count !== 1 ? "s" : ""} ${bulkMode === "hard" ? "deleted" : "unpublished"}`);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to delete users");
    }
  };

  return (
    <>
      {someSelected && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-4 py-2.5">
          <span className="text-sm text-muted-foreground">
            {selectedIds.size} selected
          </span>
          <div className="ml-auto flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setBulkMode("soft"); }}
              disabled={bulkPending}
            >
              <EyeOff className="size-4 mr-1" />
              Unpublish All
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => { setBulkMode("hard"); }}
              disabled={bulkPending}
            >
              <Trash2 className="size-4 mr-1" />
              Delete All
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right tabular-nums">Profiles</TableHead>
              <TableHead className="text-right tabular-nums">Links</TableHead>
              <TableHead className="text-right tabular-nums">Clicks</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Session</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow
                  key={u.id}
                  className="cursor-pointer"
                  onClick={() => openSheet(u)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.has(u.id)}
                      onCheckedChange={() => toggleSelect(u.id)}
                      aria-label={`Select ${u.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={u.role}
                      onValueChange={(v) => handleRoleChange(u.id, v as "USER" | "ADMIN")}
                      disabled={pendingId === u.id}
                    >
                      <SelectTrigger className="h-7 w-24 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">USER</SelectItem>
                        <SelectItem value="ADMIN">ADMIN</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {u.onboarded ? (
                      <Badge variant="outline" className="border-emerald-500/30 text-emerald-500">
                        Onboarded
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-amber-500/30 text-amber-500">
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{u.profileCount}</TableCell>
                  <TableCell className="text-right tabular-nums">{u.linkCount}</TableCell>
                  <TableCell className="text-right tabular-nums">{u.clickCount}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {u.createdAt.toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {u.lastSessionAt ? u.lastSessionAt.toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={pendingId === u.id}>
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(u.id, "soft")}
                          disabled={pendingId === u.id}
                        >
                          <EyeOff className="size-4" />
                          Unpublish
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => handleDelete(u.id, "hard")}
                          disabled={pendingId === u.id}
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={demoteTarget !== null}
        onOpenChange={(o) => { if (!o) { setDemoteTarget(null); setSelfDemote(false); } }}
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
              <AlertDialogAction onClick={confirmDemote} variant="destructive">
                Demote to User
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={bulkMode !== null}
        onOpenChange={(o) => { if (!o) setBulkMode(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkMode === "hard" ? "Delete Users" : "Unpublish Users"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkMode === "hard"
                ? `This will permanently delete ${selectedIds.size} user${selectedIds.size !== 1 ? "s" : ""} and all their data. This action cannot be undone.`
                : `This will unpublish all profiles for ${selectedIds.size} user${selectedIds.size !== 1 ? "s" : ""}.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              variant={bulkMode === "hard" ? "destructive" : "default"}
              disabled={bulkPending}
            >
              {bulkMode === "hard" ? "Delete" : "Unpublish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UserAnalyticsSheet
        user={selectedUser}
        open={sheetOpen}
        onClose={() => { setSheetOpen(false); setSelectedUser(null); }}
      />
    </>
  );
}
