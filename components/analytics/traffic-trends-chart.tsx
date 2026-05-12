"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyIcon, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp } from "lucide-react";

interface TrafficTrendsChartProps {
  data: Array<{
    date: string;
    clicks: number;
    sessions?: number;
    visitors?: number;
  }>;
  isLoading?: boolean;
  showMultipleLines?: boolean;
}

export function TrafficTrendsChart({ data, isLoading = false, showMultipleLines = false }: TrafficTrendsChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Traffic Trends</CardTitle>
          {showMultipleLines && <p className="text-sm text-muted-foreground">Daily traffic data</p>}
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="rounded-none">
        <CardHeader>
          <CardTitle>Traffic Trends</CardTitle>
          {showMultipleLines && <p className="text-sm text-muted-foreground">Daily traffic data</p>}
        </CardHeader>
        <CardContent>
          <Empty>
            <EmptyIcon>
              <TrendingUp />
            </EmptyIcon>
            <EmptyTitle>No data yet</EmptyTitle>
            <EmptyDescription>Click data will appear here as visitors interact with your links.</EmptyDescription>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl border-white/5 bg-white/5 shadow-none overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <TrendingUp className="size-4 text-blue-500" />
          Traffic Trends
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 sm:p-0">
        <div className="h-[200px] w-full pr-4 pb-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-white/5" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} className="text-[10px]" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <YAxis axisLine={false} tickLine={false} className="text-[10px]" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "#181819",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              {showMultipleLines && <Legend iconSize={8} wrapperStyle={{ fontSize: "10px", paddingTop: "10px" }} />}
              <Area type="monotone" dataKey="clicks" name={showMultipleLines ? "Pageviews" : undefined} stroke="#3b82f6" fill="url(#colorClicks)" strokeWidth={2} />
              {showMultipleLines && (
                <>
                  <Area type="monotone" dataKey="sessions" name="Sessions" stroke="#10b981" fill="url(#colorSessions)" strokeWidth={2} />
                  <Area type="monotone" dataKey="visitors" name="Visitors" stroke="#8b5cf6" fill="url(#colorVisitors)" strokeWidth={2} />
                </>
              )}
              <defs>
                <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
