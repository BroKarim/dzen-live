import { CodeIcon, DatabaseIcon, GridIcon, TerminalIcon } from "./icons";

const highlights = [
  {
    icon: CodeIcon,
    title: "Languages",
    description: "Add syntax, LSP, formatting, and tooling support.",
    className: "border-primary/20 bg-primary/10 text-primary",
  },
  {
    icon: DatabaseIcon,
    title: "Databases",
    description: "Browse schemas and query project data inline.",
    className: "border-success-foreground/20 bg-success-surface text-success-foreground",
  },
  {
    icon: GridIcon,
    title: "Themes",
    description: "Install editor themes and file icon packs.",
    className: "border-sky-500/20 bg-sky-500/10 text-sky-500 dark:text-sky-300",
  },
  {
    icon: TerminalIcon,
    title: "Agent tools",
    description: "Connect coding agents and command-line helpers.",
    className: "border-warning-foreground/20 bg-warning-surface text-warning-foreground",
  },
];

export function HighlightsSection() {
  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-8 sm:grid-cols-2 sm:px-10 lg:grid-cols-4 lg:px-16 xl:px-24" aria-label="Athas highlights">
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
