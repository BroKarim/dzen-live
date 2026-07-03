import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getOnboardingStatus } from "@/server/user/settings/actions";
import { SignInClient } from "./sign-in-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In · Dzenn",
  description: "Sign in to your Dzenn account to manage your profile and analytics.",
};

export default async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    let onboardingInfo;
    try {
      onboardingInfo = await getOnboardingStatus();
    } catch (error) {
      console.error("Auth navigation error:", error);
    }
    if (!onboardingInfo) {
      redirect("/new");
    }

    const { isOnboarded, username } = onboardingInfo;
    if (!isOnboarded || !username) {
      redirect("/new");
    } else {
      redirect(`/editor/${username}`);
    }
  }

  return (
    <Suspense fallback={null}>
      <SignInClient />
    </Suspense>
  );
}
