"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
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
import { BulkActionBar } from "./bulk-action-bar";
import { UserTableAlertDialogs } from "./user-table-alert-dialogs";

const UserAnalyticsSheet = dynamic(
  () => import("@/components/admin/user-analytics-sheet").then((m) => m.UserAnalyticsSheet),
  { ssr: false },
);

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

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(users.map((u) => u.id)));
    }
  }

  function openSheet(user: AdminUserRow) {
    setSelectedUser(user);
    setSheetOpen(true);
  }

  async function handleDelete(userId: string, mode: "soft" | "hard") {
    setPendingId(userId);
    const result = await deleteUser(userId, mode);
    setPendingId(null);
    if (result.success) {
      toast.success(mode === "hard" ? "User deleted" : "User unpublished");
    } else {
      toast.error(result.error || "Failed to delete user");
    }
  }

  async function handleRoleChange(userId: string, newRole: "USER" | "ADMIN") {
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
  }

  async function confirmDemote() {
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
  }

  async function handleBulkDelete() {
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
  }

  return (
    <>
      {someSelected && (
        <BulkActionBar
          selectedCount={selectedIds.size}
          disabled={bulkPending}
          onUnpublish={() => setBulkMode("soft")}
          onDelete={() => setBulkMode("hard")}
        />
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

      <UserTableAlertDialogs
        demoteTarget={demoteTarget}
        selfDemote={selfDemote}
        onDemoteDialogChange={(open) => { if (!open) { setDemoteTarget(null); setSelfDemote(false); } }}
        onConfirmDemote={confirmDemote}
        bulkMode={bulkMode}
        bulkPending={bulkPending}
        selectedCount={selectedIds.size}
        onBulkDialogChange={(open) => { if (!open) setBulkMode(null); }}
        onConfirmBulk={handleBulkDelete}
      />

      <UserAnalyticsSheet
        user={selectedUser}
        open={sheetOpen}
        onClose={() => { setSheetOpen(false); setSelectedUser(null); }}
      />
    </>
  );
}
