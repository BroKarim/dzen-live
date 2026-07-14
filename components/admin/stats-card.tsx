import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  label: string;
  value: number | string;
  secondary?: string;
  accent?: boolean;
}

export function StatsCard({ label, value, secondary, accent }: StatsCardProps) {
  return (
    <Card className={accent ? "border-chart-1/20" : undefined}>
      <CardContent className="p-6">
        <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">{label}</p>
        <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight">{value}</p>
        {secondary && (
          <p className="mt-1 text-xs text-muted-foreground">{secondary}</p>
        )}
      </CardContent>
    </Card>
  );
}
