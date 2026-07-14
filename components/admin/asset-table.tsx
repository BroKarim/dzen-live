"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteAsset } from "@/server/admin/actions";
import type { AdminAssetRow } from "@/server/admin/queries";

interface AssetTableProps {
  assets: AdminAssetRow[];
}

export function AssetTable({ assets }: AssetTableProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async (assetId: string) => {
    setPendingId(assetId);
    await deleteAsset(assetId);
    setPendingId(null);
    setDeleteId(null);
    router.refresh();
  };

  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Profile</TableHead>
            <TableHead>Key</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                No assets found
              </TableCell>
            </TableRow>
          ) : (
            assets.map((a) => (
              <TableRow key={a.id}>
                <TableCell>
                  <Badge variant="outline">{a.type}</Badge>
                </TableCell>
                <TableCell>
                  {a.isActive ? (
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-500">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Orphaned</Badge>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{a.userName}</TableCell>
                <TableCell className="text-xs">
                  <a href={`/${a.profileUsername}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    @{a.profileUsername}
                  </a>
                </TableCell>
                <TableCell className="max-w-48 truncate text-xs font-mono text-muted-foreground" title={a.key}>
                  {a.key}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {a.createdAt.toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <AlertDialog open={deleteId === a.id} onOpenChange={(open) => setDeleteId(open ? a.id : null)}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={pendingId === a.id}
                      >
                        <Trash2 className="size-4 text-destructive" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Asset</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this file from S3 and remove its record.
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(a.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
