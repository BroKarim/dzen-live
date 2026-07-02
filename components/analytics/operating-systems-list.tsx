"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getOSIcon } from "./analytics-icons";

interface OSItem {
  name: string;
  value: number;
}

interface OperatingSystemsListProps {
  data: OSItem[];
}

const getShare = (value: number, total: number) => {
  return total > 0 ? ((value / total) * 100).toFixed(2) : "0";
};

export function OperatingSystemsList({ data }: OperatingSystemsListProps) {
  if (data.length === 0) {
    return null;
  }

  const totalForShare = data.reduce((sum, item) => sum + item.value, 0) || 1;

  return (
    <Card className="rounded-none">
      <CardHeader>
        <CardTitle>Operating Systems</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.map((item) => {
            const OSIcon = getOSIcon(item.name);
            const share = getShare(item.value, totalForShare);
            return (
              <div
                key={item.name}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <OSIcon className="size-4" />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">{item.value}</span>
                  <span className="text-sm font-medium w-16 text-right">{share}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

