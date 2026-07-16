"use client";

import { EyeOff, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface BulkActionBarProps {
  selectedCount: number;
  disabled: boolean;
  onUnpublish: () => void;
  onDelete: () => void;
}

export function BulkActionBar({ selectedCount, disabled, onUnpublish, onDelete }: BulkActionBarProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-4 py-2.5">
      <span className="text-sm text-muted-foreground">
        {selectedCount} selected
      </span>
      <div className="ml-auto flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onUnpublish}
          disabled={disabled}
        >
          <EyeOff className="size-4 mr-1" />
          Unpublish All
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
          disabled={disabled}
        >
          <Trash2 className="size-4 mr-1" />
          Delete All
        </Button>
      </div>
    </div>
  );
}
