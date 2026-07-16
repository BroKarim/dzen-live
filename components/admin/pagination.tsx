"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
}

function PaginationInner({ currentPage, totalPages, total }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function buildHref(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (page > 1) {
      params.set("page", String(page));
    } else {
      params.delete("page");
    }
    const qs = params.toString();
    return `/admin/users${qs ? `?${qs}` : ""}`;
  }

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <p>
        {total} user{total !== 1 ? "s" : ""} total
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => router.push(buildHref(currentPage - 1))}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>
        <span className="tabular-nums">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => router.push(buildHref(currentPage + 1))}
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function PaginationSkeleton({ currentPage, totalPages, total }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <p>
        {total} user{total !== 1 ? "s" : ""} total
      </p>
      <div className="flex items-center gap-2">
        <span className="tabular-nums">
          Page {currentPage} of {totalPages}
        </span>
      </div>
    </div>
  );
}

export function Pagination(props: PaginationProps) {
  return (
    <Suspense fallback={<PaginationSkeleton {...props} />}>
      <PaginationInner {...props} />
    </Suspense>
  );
}
