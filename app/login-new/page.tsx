import { Suspense } from "react";
import { SignInClient } from "./sign-in-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In · Dzenn",
};

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInClient />
    </Suspense>
  );
}
