"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { setupUsername, checkUsernameAvailability } from "@/server/user/settings/actions";

export function NewPageDialog() {
  const { push } = useRouter();
  const [step, setStep] = useState<"welcome" | "handle">("welcome");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSetup = async () => {
    if (!username) return setError("Please provide a page slug");
    setLoading(true);
    setError("");

    const isAvailable = await checkUsernameAvailability(username).catch(() => {
      setError("Something went wrong. Please try again.");
      setLoading(false);
      return undefined;
    });

    if (isAvailable === undefined) return;

    if (!isAvailable) {
      setError("Username is already taken");
      setLoading(false);
      return;
    }

    const result = await setupUsername(username).catch(() => {
      setError("Something went wrong. Please try again.");
      setLoading(false);
      return undefined;
    });

    if (!result) return;

    if (result.success) {
      push(`/editor/${result.username}`);
    }
    setLoading(false);
  };

  return (
    <Dialog open={true}>
      <DialogContent className={`p-0 overflow-hidden border-none shadow-2xl transition-all duration-300 ${step === "welcome" ? "sm:max-w-[500px]" : "sm:max-w-[850px]"}`}>
        <DialogHeader className="hidden">
          <DialogTitle>Onboarding</DialogTitle>
        </DialogHeader>

        {step === "welcome" ? <WelcomeScreen onNext={() => setStep("handle")} /> : <HandleScreen username={username} setUsername={setUsername} error={error} loading={loading} onConfirm={handleSetup} onBack={() => setStep("welcome")} />}
      </DialogContent>
    </Dialog>
  );
}

function WelcomeScreen({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center text-center p-10 space-y-6 bg-gradient-to-b from-primary/5 to-background">
      <div className="size-20 rounded-2xl bg-primary flex items-center justify-center shadow-lg rotate-3">
        <span className="text-4xl font-bold text-white">O</span>
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight">Welcome to OneURL</h2>
        <p className="text-muted-foreground max-w-[300px] mx-auto">Let's get started with building your first page. We'll guide you step by step.</p>
      </div>
      <Button onClick={onNext} size="lg" className="w-full gap-2 group">
        Get Started <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
      </Button>
      <p className="text-xs text-slate-400">Trusted by creators worldwide</p>
    </div>
  );
}

function HandleScreen({ username, setUsername, error, loading, onConfirm, onBack }: { username: string; setUsername: (v: string) => void; error: string; loading: boolean; onConfirm: () => void; onBack: () => void }) {
  return (
    <div className="flex flex-col md:flex-row h-full min-h-[450px]">
      {/* Left: Input Section */}
      <div className="w-full md:w-1/2 p-8 flex flex-col justify-between border-r border-slate-100 dark:border-slate-800">
        <div className="space-y-6">
          <Button variant="ghost" size="sm" onClick={onBack} className="w-fit -ml-2 text-muted-foreground hover:text-foreground gap-1">
            <ArrowLeft className="size-4" /> Back
          </Button>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Choose your handle</h2>
            <p className="text-sm text-muted-foreground">This will be your page's unique web address on oneurl.com</p>
          </div>

          <HandleStep username={username} setUsername={setUsername} error={error} />
        </div>

        <div className="pt-8 space-y-3">
          <Button onClick={onConfirm} className="w-full h-12 text-base font-bold" disabled={loading || !username}>
            {loading ? <Loader2 className="size-5 animate-spin" /> : "Create My Page"}
          </Button>
          <p className="text-[10px] text-center text-muted-foreground">By continuing, you agree to our Terms of Service.</p>
        </div>
      </div>

      {/* Right: Preview Section */}
      <div className="hidden md:flex w-1/2 bg-slate-50 dark:bg-slate-900 items-center justify-center p-8">
        <PagePreview username={username} />
      </div>
    </div>
  );
}

function HandleStep({ username, setUsername, error }: { username: string; setUsername: (v: string) => void; error: string }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Your URL Handle
        </Label>
        <div className="relative flex items-center">
          <span className="absolute left-3 text-sm text-muted-foreground font-medium border-r border-slate-200 dark:border-slate-700 pr-2">oneurl.com/</span>
          <Input
            id="username"
            placeholder="your-name"
            className={`pl-[94px] h-12 text-lg font-medium focus-visible:ring-primary ${error ? "border-destructive bg-destructive/5" : "bg-background"}`}
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
          />
        </div>
        {error ? <p className="text-xs text-destructive font-medium px-1">{error}</p> : <p className="text-[11px] text-muted-foreground px-1">Only lowercase letters, numbers, dashes, and underscores allowed.</p>}
      </div>

      <div className="grid grid-cols-1 gap-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-slate-50 dark:bg-slate-800/50 p-2 rounded-md">
          <CheckCircle2 className="size-3 text-green-500" />
          Claim your unique identity
        </div>
      </div>
    </div>
  );
}

function PagePreview({ username }: { username: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-[200px] aspect-[9/18] bg-white dark:bg-black rounded-[2.5rem] border-[6px] border-slate-950 shadow-2xl overflow-hidden relative">
        {/* Mock Content */}
        <div className="flex flex-col items-center p-4 pt-10 space-y-3">
          <div className="size-12 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
          <div className="w-20 h-3 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
          <div className="w-16 h-2 bg-slate-100 dark:bg-slate-900 rounded-full animate-pulse" />

          <div className="w-full pt-4 space-y-2">
            <div className="w-full h-8 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800" />
            <div className="w-full h-8 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800" />
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-2">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Live Preview</span>
        <p className="text-sm font-mono font-medium text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">oneurl.com/{username || "..."}</p>
      </div>
    </div>
  );
}
