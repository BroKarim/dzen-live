import { Header } from "@/components/marketing/header";
import { HeroSection } from "@/components/marketing/hero-section";
import { HighlightsSection } from "@/components/marketing/hightlight-section";
import { FeaturesSection } from "@/components/marketing/feature-section";
import { FooterCTA } from "@/components/marketing/footer-cta";
import { Footer } from "@/components/marketing/footer";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dzenn - Not your ordinary linktree",
  description: "Replace your boring static website with a stunning, interactive link-in-bio that actually converts. Built for creators who demand excellence.",
};

export default function DzennHome() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 pt-16">
        <div className="space-y-24 lg:space-y-28">
          <HeroSection />
          <HighlightsSection />
          <FeaturesSection />
        </div>
      </main>
      <footer className="w-full px-4 pt-24 pb-4 font-sans sm:px-6 sm:pb-6 lg:pt-28">
        <FooterCTA />
        {/* <Footer /> */}
      </footer>
    </div>
  );
}
