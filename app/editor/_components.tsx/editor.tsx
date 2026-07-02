// app/editor/[username]/editor-content.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { findProfileByUsername } from "@/server/user/profile/queries";
import EditorClient from "../_components.tsx/editor-client";

export default async function EditorContent({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  const [session, profile] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    findProfileByUsername(username),
  ]);

  if (!session?.user) redirect("/login");

  if (!profile) notFound();
  if (profile.userId !== session.user.id) redirect("/editor");

  return <EditorClient initialProfile={profile} />;
}
