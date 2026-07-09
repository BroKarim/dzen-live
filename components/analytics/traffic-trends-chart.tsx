"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyIcon, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import dynamic from "next/dynamic";

const ChartInner = dynamic(() => import("./traffic-trends-inner").then((m) => m.ChartInner), { ssr: false });
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
        <ChartInner data={data} showMultipleLines={showMultipleLines} />
      </CardContent>
    </Card>
  );
}
