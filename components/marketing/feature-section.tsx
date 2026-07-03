import Image from "next/image";

const features = [
  {
    title: "Run AI agents inside your editor",
    description: "Use ACP-powered agents directly in Athas to inspect code, execute tasks, and work against your project context without jumping to another app.",
    image: "/images/athas/section-agents.webp",
    alt: "Athas AI agents panel",
  },
  {
    title: "Commit without switching windows",
    description: "Stage, commit, and push right where you code. Review diffs, resolve conflicts, and keep your branch clean without leaving the editor.",
    image: "/images/athas/section-commits.webp",
    alt: "Athas version control panel",
  },
  {
    title: "Search that keeps up with you",
    description: "Fuzzy file search, global text search, and a command palette. Find files, symbols, or actions in milliseconds.",
    image: "/images/athas/section-search.webp",
    alt: "Athas global file search",
  },
  {
    title: "Review pull requests without leaving your workspace",
    description: "Track open PRs, review-requested work, and details like files, commits, and comments from inside Athas.",
    image: "/images/athas/section-github.webp",
    alt: "Athas pull requests view",
  },
];

export function FeaturesSection() {
  return (
    <section className="mx-auto max-w-6xl px-8 sm:px-10 lg:px-16 xl:px-24" aria-label="Athas features">
      <div className="mx-auto mb-8 max-w-3xl text-center">
        <h2 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">Everything stays in the editor</h2>
      </div>

      <div className="space-y-14">
        {features.map((feature, i) => (
          <article key={feature.title} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
            <div className={`max-w-xl ${i % 2 === 1 ? "lg:order-2" : ""}`}>
              <h3 className="text-2xl font-medium tracking-tight text-foreground sm:text-3xl">{feature.title}</h3>
              <p className="mt-4 text-base leading-7 text-muted-foreground">{feature.description}</p>
            </div>
            <div className={`overflow-hidden rounded-lg ${i % 2 === 1 ? "lg:order-1" : ""}`}>
              <Image src={feature.image} alt={feature.alt} width={1400} height={1000} className="aspect-[16/10] w-full object-cover object-top" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
