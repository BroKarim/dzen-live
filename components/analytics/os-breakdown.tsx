"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getOSIcon } from "./analytics-icons";

interface OSItem {
  name: string;
  value: number;
}

interface OSBreakdownProps {
  data: OSItem[];
}

const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

const getOSColor = (osName: string, index: number) => {
  const lower = osName.toLowerCase();
  if (index === 0) {
    return { bg: "bg-blue-50/50 dark:bg-blue-950/30", badge: "bg-blue-500" };
  }
  if (lower.includes("macos") || lower.includes("mac") || lower.includes("ios")) {
    return { bg: "", badge: "bg-orange-500" };
  }
  return { bg: "", badge: "bg-gray-500" };
};

export function OSBreakdown({ data }: OSBreakdownProps) {
  if (data.length === 0) {
    return null;
  }

  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;

  const getShare = (value: number, total: number) => {
    return total > 0 ? ((value / total) * 100).toFixed(2) : "0";
  };

  const sortedData = data.toSorted((a, b) => b.value - a.value);

  return (
    <Card className="rounded-xl border-white/5 bg-white/5 shadow-none overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-semibold">Operating Systems</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="space-y-1">
          <div className="grid grid-cols-[1fr_50px_60px] gap-2 p-2 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider border-b border-white/5 mb-1">
            <div>OS</div>
            <div className="text-right">Clicks</div>
            <div className="text-right">Share</div>
          </div>
          {sortedData.map((item) => {
            const OSIcon = getOSIcon(item.name);
            const share = getShare(item.value, total);

            return (
              <div key={item.name} className="grid grid-cols-[1fr_50px_60px] gap-2 items-center p-2 rounded-lg hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <OSIcon className="size-3.5 shrink-0 opacity-70" />
                  <span className="text-xs font-medium truncate">{item.name}</span>
                </div>
                <div className="text-[11px] font-bold text-right text-muted-foreground">{item.value.toLocaleString()}</div>
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded-md min-w-[35px] inline-block text-center">{share}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
