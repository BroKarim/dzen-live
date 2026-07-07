import { ensureUserHasProfile } from "@/server/user/settings/actions";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editor · Dzenn",
  description: "Customize your link-in-bio page, track analytics, and manage your links in the Dzenn editor.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EditorEntryPage() {
  const { username } = await ensureUserHasProfile();
  redirect(`/editor/${username}`);
}
