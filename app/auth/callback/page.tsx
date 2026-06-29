import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { ensureUserHasProfile } from "@/server/user/settings/actions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authenticating · Dzenn",
  description: "Securely logging you in and preparing your space.",
};

export default async function AuthCallbackPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const { username } = await ensureUserHasProfile();

  redirect(`/editor/${username}`);
}
