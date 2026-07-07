import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NewPageDialog } from "@/components/new-page-dialog";
import { getOnboardingStatus } from "@/server/user/settings/actions";
import { headers } from "next/headers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Setup Your Page · Dzenn",
  description: "Claim your unique username and start building your non-chalant link-in-bio page today.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NewPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const { isOnboarded, username } = await getOnboardingStatus();
  if (isOnboarded && username) {
    redirect(`/editor/${username}`);
  }

  return <NewPageDialog />;
}
