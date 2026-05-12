"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";

export function MarketingNav() {
  const { data: session } = useSession();

  return (
    <header className="flex items-center justify-between relative border-0.5 border-b border-primary/50 px-4 sm:px-8 py-2">
      <nav className="flex text-gray-400 items-center gap-6">
        <Link href="/info" className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors">
          Info
        </Link>
        {/* <Link href="#" className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors">
          Updates
        </Link> */}
      </nav>

      {/* Center logo */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <div className="size-8 flex items-center justify-center">
          <Link href="/">
            <Image src="/images/logo.png" alt="Logo" width={32} height={32} className="w-full object-contain" />
          </Link>
        </div>
      </div>

      <Link href={session ? "/editor" : "/login"}>
        <Button size="sm" className="px-4">
          {session ? "Control Panel" : "Login"}
        </Button>
      </Link>
    </header>
  );
}
