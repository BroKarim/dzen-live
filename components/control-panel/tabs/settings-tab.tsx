"use client";

import { useState, useTransition, useCallback, useMemo } from "react";
import { User, Globe, Trash2, LogOut, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { updateProfileUsername, togglePublishStatus, deleteProfileOrAccount } from "@/server/user/settings/actions";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { ProfileEditorData } from "@/server/user/profile/payloads";

interface SettingsTabProps {
  profile: ProfileEditorData;
}

export function SettingsTab({ profile }: SettingsTabProps) {
  const { push, refresh } = useRouter();
  const [username, setUsername] = useState(profile.username);
  const [isPublished, setIsPublished] = useState(profile.isPublished);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  // Memoize expensive computations
  const hasChanges = useMemo(() => username !== profile.username || isPublished !== profile.isPublished, [username, profile.username, isPublished, profile.isPublished]);

  // Memoize username sanitization to avoid recreating function on every render
  const handleUsernameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setUsername(sanitized);
  }, []);

  const handleSaveSettings = () => {
    startTransition(async () => {
      const toastId = toast.loading("Saving settings...");
      const hasUsernameChange = username !== profile.username;
      const hasPublishChange = isPublished !== profile.isPublished;

      const promises = [];
      if (hasUsernameChange) {
        promises.push(updateProfileUsername(username));
      }
      if (hasPublishChange) {
        promises.push(togglePublishStatus(isPublished));
      }

      if (promises.length === 0) {
        toast.dismiss(toastId);
        return;
      }

      let results;
      try {
        results = await Promise.allSettled(promises);
      } catch (error) {
        toast.error("Failed to save settings", { id: toastId });
        return;
      }

      // Check results outside try block
      const usernameResult = hasUsernameChange ? (results[0] as PromiseFulfilledResult<any>).value : null;
      const publishResult = hasPublishChange ? (hasUsernameChange ? (results[1] as PromiseFulfilledResult<any>).value : (results[0] as PromiseFulfilledResult<any>).value) : null;

      let errorMsg = "";

      if (usernameResult && !usernameResult.success) {
        errorMsg += usernameResult.error + ". ";
      }
      if (publishResult && !publishResult.success) {
        errorMsg += publishResult.error;
      }

      if (errorMsg) {
        toast.error(errorMsg, { id: toastId });
        return;
      }

      toast.success("Settings saved successfully", { id: toastId });

      // Redirect to new username if changed
      if (hasUsernameChange) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("dzenn-editor-draft");
        }
        push(`/editor/${username}`);
      } else {
        refresh();
      }
    });
  };

  const handleDeleteProfile = async () => {
    setIsDeleting(true);
    const toastId = toast.loading("Deleting profile...");

    try {
      const result = await deleteProfileOrAccount();

      if (!result.success) {
        toast.error(result.error || "Failed to delete profile", { id: toastId });
        setIsDeleting(false);
        return;
      }

      toast.success("Profile deleted successfully", { id: toastId });

      // Clear localStorage to prevent stale data
      if (typeof window !== "undefined") {
        localStorage.removeItem("dzenn-editor-draft");
      }

      // Redirect based on result
      if (result.redirect) {
        push(result.redirect);
      }
    } catch (error) {
      toast.error("Failed to delete profile", { id: toastId });
      setIsDeleting(false);
    }
  };

  const handleLogout = async () => {
    const toastId = toast.loading("Logging out...");
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            // Clear localStorage on logout
            if (typeof window !== "undefined") {
              localStorage.removeItem("dzenn-editor-draft");
            }
            toast.success("Logged out successfully", { id: toastId });
            push("/");
          },
          onError: () => {
            toast.error("Failed to logout", { id: toastId });
          },
        },
      });
    } catch (error) {
      toast.error("Failed to logout", { id: toastId });
    }
  };

  return (
    <div className="px-3 pb-4">
      <p className="text-sm text-muted-foreground">Manage your profile settings</p>
      <div className="space-y-6">
        {/* Username Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <User className="size-4 text-muted-foreground" />
            <Label htmlFor="username" className="text-sm font-medium">
              Username
            </Label>
          </div>
          <div className="relative flex items-center w-full max-w-md">
            <div className="relative flex-1 flex items-center overflow-hidden">
              <div className="absolute left-4 text-sm text-muted-foreground font-medium pointer-events-none">dzenn.live/</div>
              <input
                id="username"
                value={username}
                onChange={handleUsernameChange}
                placeholder="your-username"
                aria-label="Username"
                className="w-full text-sm pl-[88px] pr-4 py-2 h-10 transition-all bg-muted/30 hover:bg-muted/50 border border-border rounded-full text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Choose a unique username for your profile URL</p>
        </div>

        <Separator />

        {/* Publish Status Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Globe className="size-4 text-muted-foreground" />
                <Label htmlFor="publish-status" className="text-sm font-medium">
                  Publish Profile
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">Make your profile visible to the public</p>
            </div>
            <Switch id="publish-status" checked={isPublished} onCheckedChange={setIsPublished} />
          </div>
        </div>

        <Separator />

        {/* Save Button */}
        <Button onClick={handleSaveSettings} disabled={!hasChanges || isPending} className="w-full">
          {isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>

        <Separator />

        {/* Danger Zone */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-destructive">Danger Zone</h3>

          {/* Delete Profile */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full text-destructive border-white/5 bg-white/5 hover:bg-destructive/10 hover:border-destructive/50 transition-colors">
                <Trash2 className="mr-2 size-4" />
                Delete Profile
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-white/10 bg-zinc-950 shadow-dzenn">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl font-bold">Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="text-zinc-400">
                  This action is irreversible. This will permanently delete your profile and all associated data.
                  {profile.username && <span className="block mt-2 font-medium text-destructive">Warning: dzenn.live/{profile.username} will be gone forever.</span>}
                  If this is your only profile, your entire account will also be closed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-4">
                <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5 text-white">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteProfile} disabled={isDeleting} className="bg-destructive text-white hover:bg-destructive/90 border-none px-6">
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Permanently"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Logout */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                <LogOut className="mr-2 size-4" />
                Logout
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-white/10 bg-zinc-950 shadow-dzenn max-w-[400px]">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl font-bold">Ready to leave?</AlertDialogTitle>
                <AlertDialogDescription className="text-zinc-400">You'll be signed out of your account on this device. Any unsaved changes in the editor might be lost.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-4">
                <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5 text-white">Stay logged in</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout} className="bg-white text-black hover:bg-zinc-200 border-none px-6">
                  Logout
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
