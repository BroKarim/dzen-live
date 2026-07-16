"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Loader2 } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { getUserAnalyticsAction } from "@/server/admin/actions";
import type { AdminUserRow, UserClickAnalytics } from "@/server/admin/queries";

interface UserAnalyticsSheetProps {
  user: AdminUserRow | null;
  open: boolean;
  onClose: () => void;
}

export function UserAnalyticsSheet({ user, open, onClose }: UserAnalyticsSheetProps) {
  const [data, setData] = useState<UserClickAnalytics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!open || !user) return;
    setLoading(true);
    getUserAnalyticsAction(user.id).then((result) => {
      if (cancelled) return;
      setData(result);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [open, user]);

  if (!user) return null;

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent className="sm:max-w-lg w-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {user.name}
            <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
              {user.role}
            </Badge>
          </SheetTitle>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : data ? (
          <div className="space-y-6 p-4 pt-2">
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold">{data.profiles.length}</p>
                <p className="text-xs text-muted-foreground">Profiles</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold">
                  {data.profiles.reduce((s, p) => s + p.linkCount, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Links</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold">{data.totalClicks}</p>
                <p className="text-xs text-muted-foreground">Clicks</p>
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-medium">Clicks (30 days)</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.dailyClicks} margin={{ top: 4, right: 4, bottom: 4, left: -16 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d: string) => {
                        const date = new Date(d + "T00:00:00Z");
                        return date.toLocaleDateString("en", { month: "short", day: "numeric" });
                      }}
                      tick={{ fontSize: 10 }}
                      className="text-muted-foreground"
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      className="text-muted-foreground"
                      axisLine={false}
                      tickLine={false}
                      width={30}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius)",
                        fontSize: 12,
                      }}
                      labelFormatter={(d: string) => {
                        const date = new Date(d + "T00:00:00Z");
                        return date.toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" });
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="var(--chart-1)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 3 }}
                      name="Clicks"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {data.profiles.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium">Profiles</h4>
                <div className="space-y-1">
                  {data.profiles.map((p) => (
                    <Link
                      key={p.id}
                      href={`/admin/profiles`}
                      className="flex items-center justify-between rounded-md border px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
                    >
                      <span className="font-medium">{p.displayName || p.username}</span>
                      <span className="text-xs text-muted-foreground">
                        {p.linkCount} links · {p.clickCount} clicks
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="mb-2 text-sm font-medium">Top Referrers</h4>
                {data.topReferrers.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No data</p>
                ) : (
                  <div className="space-y-1">
                    {data.topReferrers.map((r) => (
                      <div key={r.referrer} className="flex justify-between text-sm">
                        <span className="truncate text-muted-foreground max-w-[120px]">{r.referrer}</span>
                        <span className="tabular-nums">{r.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <h4 className="mb-2 text-sm font-medium">Top Countries</h4>
                {data.topCountries.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No data</p>
                ) : (
                  <div className="space-y-1">
                    {data.topCountries.map((c) => (
                      <div key={c.country} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{c.country}</span>
                        <span className="tabular-nums">{c.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-medium">Top Devices</h4>
              {data.topDevices.length === 0 ? (
                <p className="text-xs text-muted-foreground">No data</p>
              ) : (
                <div className="space-y-1">
                  {data.topDevices.map((d) => (
                    <div key={d.device} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{d.device}</span>
                      <span className="tabular-nums">{d.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-20 text-center text-sm text-muted-foreground">
            Failed to load analytics
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
