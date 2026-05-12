import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getOnboardingStatus } from "@/server/user/settings/actions";
import { LoginClient } from "./login-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login · Dzenn",
  description: "Sign in to your Dzenn account to manage your profile and analytics.",
};

export default async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Server-side redirect if authenticated
  if (session?.user) {
    let onboardingInfo;
    try {
      onboardingInfo = await getOnboardingStatus();
    } catch (error) {
      console.error("Auth navigation error:", error);
      redirect("/new");
    }

    const { isOnboarded, username } = onboardingInfo!;
    if (!isOnboarded || !username) {
      redirect("/new");
    } else {
      redirect(`/editor/${username}`);
    }
  }

  // If no session, show the login UI
  return (
    <Suspense fallback={null}>
      <LoginClient />
    </Suspense>
  );
}
