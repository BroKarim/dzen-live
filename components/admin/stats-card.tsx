interface StatsCardProps {
  label: string;
  value: number | string;
  secondary?: string;
}

export function StatsCard({ label, value, secondary }: StatsCardProps) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
      {secondary && (
        <p className="mt-0.5 text-xs text-muted-foreground">{secondary}</p>
      )}
    </div>
  );
}
