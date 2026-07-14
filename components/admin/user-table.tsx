"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Trash2, EyeOff, ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { deleteUser } from "@/server/admin/actions";
import type { AdminUserRow } from "@/server/admin/queries";

interface UserTableProps {
  users: AdminUserRow[];
}

export function UserTable({ users }: UserTableProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const handleDelete = async (userId: string, mode: "soft" | "hard") => {
    setPendingId(userId);
    await deleteUser(userId, mode);
    setPendingId(null);
  };

  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
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
              <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="font-medium">{u.name}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>
                    {u.role}
                  </Badge>
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
                <TableCell>
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
  );
}
