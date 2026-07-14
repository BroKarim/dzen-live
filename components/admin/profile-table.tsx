"use client";

import { ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { AdminProfileRow } from "@/server/admin/queries";

interface ProfileTableProps {
  profiles: AdminProfileRow[];
}

export function ProfileTable({ profiles }: ProfileTableProps) {
  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Display Name</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Published</TableHead>
            <TableHead>Background</TableHead>
            <TableHead className="text-right tabular-nums">Links</TableHead>
            <TableHead className="text-right tabular-nums">Clicks</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                No profiles found
              </TableCell>
            </TableRow>
          ) : (
            profiles.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">
                  <a
                    href={`/${p.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:underline"
                  >
                    @{p.username}
                    <ExternalLink className="size-3 text-muted-foreground" />
                  </a>
                </TableCell>
                <TableCell className="text-muted-foreground">{p.displayName ?? "—"}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{p.userName}</TableCell>
                <TableCell>
                  {p.isPublished ? (
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-500">
                      Published
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Unpublished</Badge>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground capitalize">{p.bgType}</TableCell>
                <TableCell className="text-right tabular-nums">{p.linkCount}</TableCell>
                <TableCell className="text-right tabular-nums">{p.clickCount}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {p.createdAt.toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <a
                    href={`/${p.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <ExternalLink className="size-4" />
                    <span className="sr-only">View @{p.username}</span>
                  </a>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
