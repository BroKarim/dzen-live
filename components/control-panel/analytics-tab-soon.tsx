"use client";

import { BarChart3 } from "lucide-react";

export function AnalyticsTabSoon() {
  return (
    <div className="relative min-h-[400px] w-full flex flex-col items-center justify-center p-6 text-center">
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
          <BarChart3 className="size-8 text-primary" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold tracking-tight text-foreground">Advanced Analytics</h3>
          <p className="text-sm text-muted-foreground max-w-[280px] mx-auto leading-relaxed">We are building a powerful dashboard to help you track clicks, visitors, and growth in real-time.</p>
        </div>

        <div className="mt-2">
          <span className="bg-primary/10 text-primary text-[11px] font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.2em] border border-primary/20">Coming Soon</span>
        </div>
      </div>
    </div>
  );
}
