"use client";

import { AuthCard } from "@/components/auth/auth-card";

export function LoginClient() {
  return (
    <div className="h-svh w-full overflow-y-auto bg-background flex flex-col items-center px-4 py-6 sm:py-10">
      <div className="w-full max-w-sm space-y-4 my-auto">
        <AuthCard />
      </div>
    </div>
  );
}
