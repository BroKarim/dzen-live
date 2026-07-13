"use client";

import { useState } from "react";
import { deleteUser } from "@/server/admin/actions";
import type { AdminUserRow } from "@/server/admin/queries";

interface UserTableProps {
  users: AdminUserRow[];
}

export function UserTable({ users }: UserTableProps) {
  const [pendingId, setPendingId] = useState<string | null>(null);

  const handleDelete = async (userId: string, mode: "soft" | "hard") => {
    setPendingId(userId);
    await deleteUser(userId, mode);
    setPendingId(null);
  };

  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Role</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Onboarded</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Profiles</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Links</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Clicks</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Created</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Last Session</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 && (
            <tr>
              <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                No users found
              </td>
            </tr>
          )}
          {users.map((u) => (
            <tr key={u.id} className="border-t hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3">
                <div className="font-medium">{u.name}</div>
                <div className="text-xs text-muted-foreground">{u.email}</div>
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  u.role === "ADMIN" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" : "bg-muted text-muted-foreground"
                }`}>
                  {u.role}
                </span>
              </td>
              <td className="px-4 py-3">{u.onboarded ? "Yes" : "No"}</td>
              <td className="px-4 py-3 tabular-nums">{u.profileCount}</td>
              <td className="px-4 py-3 tabular-nums">{u.linkCount}</td>
              <td className="px-4 py-3 tabular-nums">{u.clickCount}</td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {u.createdAt.toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {u.lastSessionAt ? u.lastSessionAt.toLocaleDateString() : "—"}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={pendingId === u.id}
                    onClick={() => handleDelete(u.id, "soft")}
                    className="rounded px-2 py-1 text-xs font-medium text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30 disabled:opacity-50"
                  >
                    Soft
                  </button>
                  <button
                    type="button"
                    disabled={pendingId === u.id}
                    onClick={() => handleDelete(u.id, "hard")}
                    className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
