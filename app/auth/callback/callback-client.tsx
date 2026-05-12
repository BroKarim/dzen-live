"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

interface CallbackClientProps {
  redirectTo: string;
}

export function CallbackClient({ redirectTo }: CallbackClientProps) {
  const { replace } = useRouter();

  useEffect(() => {
    // Small delay to allow the animation/brand to be seen
    const timer = setTimeout(() => {
      replace(redirectTo);
    }, 800);
    return () => clearTimeout(timer);
  }, [replace, redirectTo]);

  const getMessage = () => {
    if (redirectTo.startsWith("/editor") || redirectTo === "/editor") {
      return "Preparing your creative space";
    }
    if (redirectTo === "/login") {
      return "Returning to login";
    }
    return "Redirecting...";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 overflow-hidden relative">
      <div className="text-center space-y-8 px-4 relative z-10">
        <div className="flex justify-center">
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-white/10 blur-2xl rounded-full scale-110 opacity-50 group-hover:opacity-100 transition-opacity" />

            <div className="relative size-20 flex items-center justify-center rounded-2xl bg-[#222] border-none text-white font-bold text-3xl shadow-dzenn">Dz</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center gap-3">
            <Spinner className="size-4 text-white/40" />
            <p className="text-sm font-medium text-white tracking-widest uppercase opacity-70">{getMessage()}</p>
          </div>
          <p className="text-[10px] text-white/30 tracking-[0.2em] font-light italic">Dzenn · Built for creators</p>
        </div>
      </div>

      {/* Subtle background details */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
}
