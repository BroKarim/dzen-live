import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  iconColor: string;
  isPositive?: (change: number) => boolean;
}

export function MetricCard({ title, value, change, icon: Icon, iconColor, isPositive = (c) => c >= 0 }: MetricCardProps) {
  const showChange = change !== undefined;
  const positive = showChange ? isPositive(change) : true;
  const changeValue = showChange ? Math.abs(change) : 0;

  return (
    <Card className="rounded-xl border-white/5 bg-white/5 shadow-none">
      <CardHeader className="p-3 pb-1">
        <CardTitle className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1.5">
          <Icon className={`size-3 ${iconColor}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <p className="text-xl font-bold">{value}</p>
        {showChange && (
          <div className="flex items-center gap-1 mt-0.5">
            {positive ? <ArrowUp className="size-3 text-emerald-500" /> : <ArrowDown className="size-3 text-red-500" />}
            <span className={`text-[10px] font-medium ${positive ? "text-emerald-500" : "text-red-500"}`}>{changeValue.toFixed(0)}%</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
