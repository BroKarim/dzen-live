"use client";

import { Plus, Trash2, Edit2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Button2 } from "@/components/button-2";
import { Input } from "@/components/ui/input";
import { Globe } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { SOCIAL_PLATFORMS } from "@/lib/sosmed";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ProfileEditorData } from "@/server/user/profile/payloads";
import { createSocialLink, updateSocialLink, deleteSocialLink } from "@/server/user/links/actions";
import { toast } from "sonner";

interface SocialMediaEditorProps {
  profile: ProfileEditorData;
  onUpdate: (profile: ProfileEditorData) => void;
}

export function SocialMediaEditor({ profile, onUpdate }: SocialMediaEditorProps) {
  const [formState, setFormState] = useState({
    isOpen: false,
    editingId: null as string | null,
    selectedPlatform: "",
    url: "",
    searchQuery: "",
  });

  const resetForm = () => {
    setFormState({
      isOpen: false,
      editingId: null,
      selectedPlatform: "",
      url: "",
      searchQuery: "",
    });
  };

  const handleOpenEdit = (social: any) => {
    setFormState(prev => ({
      ...prev,
      editingId: social.id,
      selectedPlatform: social.platform,
      url: social.url,
      isOpen: true,
    }));
  };

  const handleSave = () => {
    if (!formState.selectedPlatform) return;

    if (formState.editingId) {
      const updatedSocials = profile.socials.map((s) => (s.id === formState.editingId ? { ...s, platform: formState.selectedPlatform, url: formState.url } : s));
      onUpdate({ ...profile, socials: updatedSocials });
    } else {
      const newSocial = {
        id: `temp-${Date.now()}`,
        platform: formState.selectedPlatform,
        url: formState.url,
        position: profile.socials.length,
      };
      onUpdate({ ...profile, socials: [...profile.socials, newSocial as any] });
    }
    resetForm();
  };

  const removeSocial = (id: string) => {
    onUpdate({
      ...profile,
      socials: profile.socials.filter((s) => s.id !== id),
    });
  };

  const filteredPlatforms = SOCIAL_PLATFORMS.filter((p) => p.label.toLowerCase().includes(formState.searchQuery.toLowerCase()));

  return (
    <div className="space-y-4">
      <Dialog
        open={formState.isOpen}
        onOpenChange={(open) => {
          if (!open) resetForm();
          setFormState((prev) => ({ ...prev, isOpen: open }));
        }}
      >
        <div className="flex justify-end">
          <DialogTrigger asChild>
            <Button2 variant="blue" className="w-1/3 border-dashed rounded-md border text-xs">
              <Plus className="size-4" /> Add Social Media
            </Button2>
          </DialogTrigger>
        </div>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{formState.editingId ? "Edit Social Link" : "Add Social Link"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label>Select Platform</Label>

              <Input placeholder="Search platform..." value={formState.searchQuery} onChange={(e) => setFormState((prev) => ({ ...prev, searchQuery: e.target.value }))} className="mb-2" />

              <ScrollArea className="h-[240px] rounded-md border p-2">
                <div className="grid grid-cols-2 gap-2">
                  {filteredPlatforms.length > 0 ? (
                    filteredPlatforms.map((platform) => {
                      const Icon = platform.icon;
                      const isSelected = formState.selectedPlatform === platform.id;

                      return (
                        <button
                          key={platform.id}
                          type="button"
                          onClick={() => setFormState((prev) => ({ ...prev, selectedPlatform: platform.id }))}
                          className={`flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all hover:border-primary/50 ${isSelected ? "border-primary bg-primary/10 text-primary" : "border-muted bg-card"}`}
                        >
                          <Icon className={`size-5 shrink-0 ${isSelected ? "text-primary" : ""}`} />
                          <span className="text-sm font-medium truncate">{platform.label}</span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="col-span-2 flex items-center justify-center py-8 text-sm text-muted-foreground">No platform found</div>
                  )}
                </div>
              </ScrollArea>
            </div>

            <div className="space-y-2">
              <Label>URL / Link</Label>
              <Input placeholder="https://..." value={formState.url} onChange={(e) => setFormState((prev) => ({ ...prev, url: e.target.value }))} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" type="button" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formState.selectedPlatform}>
              {formState.editingId ? "Update Link" : "Add to Profile"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-2">
        {profile.socials?.map((social: any) => {
          const platform = SOCIAL_PLATFORMS.find((p) => p.id === social.platform);
          const Icon = platform?.icon || Globe;
          return (
            <div key={social.id} className="flex items-center justify-between group rounded-xl border bg-card p-3 transition-all hover:border-primary/50">
              <button type="button" className="flex flex-1 items-center gap-3 cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-lg text-left" onClick={() => handleOpenEdit(social)}>
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                  <Icon className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold capitalize">{platform?.label || social.platform}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">{social.url || "No link added"}</p>
                </div>
              </button>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="ghost" onClick={() => handleOpenEdit(social)}>
                  <Edit2 className="size-4" />
                </Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => removeSocial(social.id)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
