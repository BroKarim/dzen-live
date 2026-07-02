"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { getDeviceIcon } from "./analytics-icons";

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#14b8a6", "#6366f1", "#ef4444"];

interface DataItem {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface DeviceBrowserChartsProps {
  deviceData?: DataItem[];
  browserData?: DataItem[];
}

const EMPTY_ARRAY: DataItem[] = [];

const totalForShare = (data: DataItem[]) => {
  return data.reduce((sum, item) => sum + item.value, 0) || 1;
};

const getShare = (value: number, total: number) => {
  return total > 0 ? ((value / total) * 100).toFixed(2) : "0";
};

export function DeviceBrowserCharts({ deviceData = EMPTY_ARRAY, browserData = EMPTY_ARRAY }: DeviceBrowserChartsProps) {
  if (deviceData.length === 0 && browserData.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {deviceData.length > 0 && (
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle>Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={deviceData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} outerRadius={80} fill="#3b82f6" dataKey="value">
                  {deviceData.map((item) => (
                    <Cell key={item.name} fill={COLORS[deviceData.indexOf(item) % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {deviceData.map((item) => {
                const DeviceIcon = getDeviceIcon(item.name);
                return (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <DeviceIcon className="size-4" />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {browserData.length > 0 && (
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle>Browsers</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={browserData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} outerRadius={80} fill="#3b82f6" dataKey="value">
                  {browserData.map((item) => (
                    <Cell key={item.name} fill={COLORS[browserData.indexOf(item) % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {browserData.map((item) => {
                const total = totalForShare(browserData);
                const share = getShare(item.value, total);
                return (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <span>{item.name}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">{item.value}</span>
                      <span className="font-medium w-16 text-right">{share}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
