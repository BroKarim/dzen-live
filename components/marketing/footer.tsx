import Image from "next/image";
import Link from "next/link";
import { GithubIcon, TwitterIcon, BlueskyIcon, LinkedInIcon, DiscordIcon } from "./icons";

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Download", href: "/athas/download" },
      { label: "Extensions", href: "/athas/extensions" },
      { label: "Pricing", href: "/athas/pricing" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Docs", href: "/athas/docs" },
      { label: "Roadmap", href: "/athas/roadmap" },
      { label: "Blog", href: "/athas/blog" },
      { label: "Changelog", href: "/athas/changelog" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/athas/about" },
      { label: "Enterprise", href: "/athas/enterprise" },
      { label: "Security", href: "/athas/security" },
      { label: "Support", href: "/athas/support" },
      {
        label: "Newsletter",
        href: "https://athasdev.lemonsqueezy.com/",
        external: true,
      },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: "/athas/terms" },
      { label: "Privacy", href: "/athas/privacy" },
      { label: "Cookies", href: "/athas/cookies" },
    ],
  },
];

const socialLinks = [
  {
    label: "GitHub",
    href: "https://github.com/athasdev/athas",
    icon: GithubIcon,
  },
  {
    label: "X (Twitter)",
    href: "https://x.com/athasindustries",
    icon: TwitterIcon,
  },
  {
    label: "Bluesky",
    href: "https://bsky.app/profile/athasindustries.bsky.social",
    icon: BlueskyIcon,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/athasindustries/",
    icon: LinkedInIcon,
  },
  {
    label: "Discord",
    href: "https://discord.gg/DD8F38wFMv",
    icon: DiscordIcon,
  },
];

export function Footer() {
  return (
    <div className="w-full rounded-xl bg-muted dark:bg-surface">
      <div className="mx-auto max-w-screen-2xl px-6 py-10 sm:px-8 sm:py-12 lg:px-10">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <Link href="/athas" className="flex items-center gap-2 font-semibold text-foreground">
              <Image src="/images/athas/logo.png" alt="Athas" width={32} height={32} className="size-8 shrink-0 rounded" />
              <span>Athas</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">A lightweight code editor.</p>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="mb-4 text-sm font-semibold text-foreground">{group.title}</h4>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-5 text-center sm:mt-12 sm:grid sm:grid-cols-3 sm:text-left">
          <div className="flex items-center justify-center gap-3 sm:justify-start">
            {socialLinks.map((social) => (
              <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label} className="text-muted-foreground transition-colors hover:text-foreground">
                <social.icon className="size-4" />
              </a>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm">
            <p className="text-muted-foreground">&copy; 2026 Athas Industries</p>
            <button type="button" className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline">
              Manage cookies
            </button>
          </div>

          <div className="flex justify-center sm:justify-end">
            <div className="flex items-center gap-1 rounded-lg">
              <div className="size-7" />
              <div className="size-7" />
              <div className="size-7" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
