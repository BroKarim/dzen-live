"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserTableToolbarProps {
  initialSearch: string;
  initialRole: string | null;
}

export function UserTableToolbar({ initialSearch, initialRole }: UserTableToolbarProps) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildHref = useCallback(
    (q: string, r: string | null, p?: number) => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (r) params.set("role", r);
      if (p && p > 1) params.set("page", String(p));
      const qs = params.toString();
      return `/admin/users${qs ? `?${qs}` : ""}`;
    },
    [],
  );

  const navigate = useCallback(
    (q: string, r: string | null) => {
      router.push(buildHref(q, r));
    },
    [router, buildHref],
  );

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      navigate(value, initialRole);
    }, 300);
  };

  const handleRoleChange = (value: string) => {
    const role = value === "all" ? null : value;
    navigate(search, role);
  };

  const handleClear = () => {
    setSearch("");
    navigate("", initialRole);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9 pr-8"
        />
        {search && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      <Select
        value={initialRole || "all"}
        onValueChange={handleRoleChange}
      >
        <SelectTrigger className="w-28 h-9 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="ADMIN">ADMIN</SelectItem>
          <SelectItem value="USER">USER</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
