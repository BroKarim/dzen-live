import { Heart, Code2, ChartLine } from "lucide-react";

const highlights = [
  {
    icon: Heart,
    title: "100% Free",
    description: "All core features are completely free, no hidden fees or subscription required.",
    className: "border-primary/20 bg-primary/10 text-primary",
  },
  {
    icon: Code2,
    title: "Open Source",
    description: "Fully transparent codebase you can audit, fork, and contribute to.",
    className: "border-sky-500/20 bg-sky-500/10 text-sky-500 dark:text-sky-300",
  },
  {
    icon: ChartLine,
    title: "360° Deep Analytics",
    description: "Gain comprehensive insights with real‑time, granular analytics for every link.",
    className: "border-warning-foreground/20 bg-warning-surface text-warning-foreground",
  },
];

export function HighlightsSection() {
  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-8 sm:grid-cols-2 sm:px-10 lg:grid-cols-3 lg:px-16 xl:px-24" aria-label="Dzenn highlights">
      {highlights.map((item) => (
        <div key={item.title} className="min-w-0">
          <div className={`inline-flex size-11 items-center justify-center rounded-lg border ${item.className}`}>
            <item.icon className="size-5" />
          </div>
          <h2 className="mt-5 text-lg font-medium tracking-tight text-foreground">{item.title}</h2>
          <p className="mt-3 text-base leading-6 text-muted-foreground">{item.description}</p>
        </div>
      ))}
    </section>
  );
}
