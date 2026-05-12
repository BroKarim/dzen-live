import Image from "next/image";
import { MarketingNav } from "@/components/marketing/nav";

const BACKGROUND_STYLE = {
  backgroundImage: "url('https://images.unsplash.com/photo-1597200381847-30ec200eeb9a?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
} as const;

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Fixed background */}
      <div className="fixed inset-0 -z-10" style={BACKGROUND_STYLE} />

      {/* Scrollable content */}
      <section>
        <div className="pt-10 sm:pt-16 px-2 md:px-0">
          <div className="bg-[#f2f7fb] border-primary/30 rounded-2xl relative z-10 mx-auto max-w-4xl flex flex-col min-h-screen">
            <MarketingNav />
            <main className="flex-1 flex flex-col">{children}</main>

            {/* Minimal Footer */}
          </div>
          <footer className="mt-auto w-full py-8  flex items-center justify-center gap-2 text-xs text-gray-600">
            <Image src="/images/logo.png" alt="dzenn logo" width={16} height={16} className="opacity-60 grayscale" />
            <span>
              <span className="font-bold">dzenn.live</span> &copy; 2026 dzenn
            </span>
          </footer>
        </div>
      </section>
    </div>
  );
}
