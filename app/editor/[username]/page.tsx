// app/editor/[username]/page.tsx
import { Suspense } from "react";
import EditorContent from "@/app/editor/_components.tsx/editor";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `Editing @${username} · Dzenn`,
    description: `Customize and manage your @${username} link-in-bio page on Dzenn.`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function EditorPage({ params }: { params: Promise<{ username: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse">Loading editor...</div>
        </div>
      }
    >
      <EditorContent params={params} />
    </Suspense>
  );
}
