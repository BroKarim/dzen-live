"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";

interface ChartInnerProps {
  data: Array<{
    date: string;
    clicks: number;
    sessions?: number;
    visitors?: number;
  }>;
  showMultipleLines?: boolean;
}

export function ChartInner({ data, showMultipleLines }: ChartInnerProps) {
  return (
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
  );
}
