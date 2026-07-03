import Image from "next/image";

const features = [
  {
    tag: "Profile",
    title: "Your identity, your way.",
    description: "Build a stunning profile that reflects who you are. Customize every element to match your personal brand and style.",
    mediaSrc: "https://d1uuiykksp6inc.cloudfront.net/demo/v0/final1.mp4",
    alt: "Dzenn profile customisation",
  },
  {
    tag: "Theme",
    title: "Make it yours, down to the last pixel.",
    description: "Fine-tune colours, typography, and layouts until every pixel feels unmistakably yours.",
    mediaSrc: "https://d1uuiykksp6inc.cloudfront.net/demo/v0/final2-v1.mp4",
    alt: "Dzenn theme editor",
  },
  {
    tag: "Analytics",
    title: "Know exactly who's clicking, and from where.",
    description: "See every tap, every referrer, every location. Deep analytics give you the full picture of your audience.",
    mediaSrc: "https://d1uuiykksp6inc.cloudfront.net/demo/v0/demo3.webp",
    alt: "Dzenn analytics dashboard",
  },
];

function FeatureMedia({ src, alt }: { src: string; alt: string }) {
  const isVideo = src.endsWith(".mp4") || src.endsWith(".webm");

  return (
    <div className="overflow-hidden rounded-lg bg-foreground/5 border border-foreground/10">
      {isVideo ? (
        <video src={src} className="aspect-[16/10] w-full object-cover object-top" autoPlay muted loop playsInline preload="metadata" aria-label={alt} />
      ) : (
        <Image src={src} alt={alt} width={1400} height={1000} className="aspect-[16/10] w-full object-cover object-top" />
      )}
    </div>
  );
}

export function FeaturesSection() {
  return (
    <section className="mx-auto max-w-6xl px-8 sm:px-10 lg:px-16 xl:px-24" aria-label="Dzenn features">
      <div className="mx-auto mb-8 max-w-3xl text-center">
        <h2 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">Everything your link-in-bio should be</h2>
      </div>

      <div className="space-y-14">
        {features.map((feature, i) => (
          <article key={feature.tag} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
            <div className={`max-w-xl ${i % 2 === 1 ? "lg:order-2" : ""}`}>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{feature.tag}</span>
              <h3 className="text-2xl font-medium tracking-tight text-foreground sm:text-3xl mt-2">{feature.title}</h3>
              <p className="mt-4 text-base leading-7 text-muted-foreground">{feature.description}</p>
            </div>
            <div className={`${i % 2 === 1 ? "lg:order-1" : ""}`}>
              <FeatureMedia src={feature.mediaSrc} alt={feature.alt} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
