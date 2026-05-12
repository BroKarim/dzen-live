"use client";

import { SignInButton } from "@/components/sign-in-button";
import { Icons } from "@/components/icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AuthCard() {
  return (
    <Card className="w-full border-none bg-transparent shadow-none">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-3xl font-bold tracking-tight">Welcome back</CardTitle>
        <CardDescription>Choose your preferred sign in method to continue</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 mt-4">
        <SignInButton className="w-full h-12 bg-white text-black hover:bg-zinc-100 border border-zinc-200 shadow-sm transition-all duration-200 font-semibold rounded-xl gap-3" callbackURL="/auth/callback">
          <Icons.google className="size-5" />
          Continue with Google
        </SignInButton>
        <div className="relative mt-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-200/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-transparent px-2 text-muted-foreground font-medium">Secure Auth</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
