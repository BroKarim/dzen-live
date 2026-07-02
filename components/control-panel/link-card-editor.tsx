"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Loader2, Plus, Link as LinkIcon, Image as ImageIcon, X, GripVertical, Pencil, Trash2, ExternalLink } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import type { ProfileEditorData } from "@/server/user/profile/payloads";
import { uploadFile } from "@/lib/upload";
import { LinkEditDialog } from "./link-edit-dialog";
import { toast } from "sonner";
import { Button2 } from "@/components/ui/button-2";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface LinkCardEditorProps {
  profile: ProfileEditorData;
  onUpdate: (profile: ProfileEditorData) => void;
}

type LinkType = "url" | "media";

export function LinkCardEditor({ profile, onUpdate }: LinkCardEditorProps) {
  const [uiState, setUiState] = useState({
    isAdding: false,
    isSaving: false,
    selectedType: "url" as LinkType,
    deleteDialogOpen: false,
    deletingId: null as string | null,
    mediaPreview: null as string | null,
    editingLink: null as any | null,
    editDialogOpen: false,
  });

  const [newLink, setNewLink] = useState({
    title: "",
    url: "",
    description: "",
    mediaUrl: null as string | null,
  });

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const publicUrl = await uploadFile(file, {
        allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/jpg"],
        maxSizeMB: 10,
        compression: { maxSizeMB: 0.5, maxWidthOrHeight: 800 },
      });
      setNewLink((prev) => ({ ...prev, mediaUrl: publicUrl }));
      setUiState((prev) => ({ ...prev, mediaPreview: publicUrl }));
    } catch (error: any) {
      toast.error(error.message || "Error uploading media");
    }
  };

  const handleAdd = async () => {
    const payload = {
      id: `temp-${Date.now()}`,
      title: newLink.title,
      url: newLink.url.trim(),
      description: newLink.description || null,
      mediaUrl: newLink.mediaUrl || null,
      position: profile.links.length,
      isActive: true,
    } as any;

    const { LinkSchema } = await import("@/server/user/links/schema");
    const { id, ...validationPayload } = payload;
    const validation = LinkSchema.safeParse(validationPayload);

    if (!validation.success) {
      const firstError = validation.error.issues[0];
      toast.error(firstError.message);
      return;
    }

    onUpdate({ ...profile, links: [...profile.links, payload] });
    resetForm();
  };

  const handleDelete = (id: string) => {
    onUpdate({
      ...profile,
      links: profile.links.filter((l) => l.id !== id),
    });
  };

  const resetForm = () => {
    setUiState((prev) => ({
      ...prev,
      isAdding: false,
      selectedType: "url",
      mediaPreview: null,
    }));
    setNewLink({
      title: "",
      url: "",
      description: "",
      mediaUrl: null,
    });
  };

  const handleEdit = (link: any) => {
    setUiState((prev) => ({
      ...prev,
      editingLink: link,
      editDialogOpen: true,
    }));
  };

  const handleEditSave = (updatedLink: any) => {
    onUpdate({
      ...profile,
      links: profile.links.map((l) => (l.id === updatedLink.id ? updatedLink : l)),
    });
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = profile.links.findIndex((l) => l.id === active.id);
    const newIndex = profile.links.findIndex((l) => l.id === over.id);

    const newLinks = arrayMove(profile.links, oldIndex, newIndex).map((link, index) => ({
      ...link,
      position: index,
    }));

    onUpdate({ ...profile, links: newLinks });
  };

  const typeOptions = [
    { id: "url" as LinkType, icon: LinkIcon, label: "URL" },
    { id: "media" as LinkType, icon: ImageIcon, label: "Media" },
  ];

  return (
    <div className="space-y-3">
      {!uiState.isAdding && (
        <div className="flex justify-end">
          <Button2 onClick={() => setUiState((prev) => ({ ...prev, isAdding: true }))} variant="blue" className="w-1/3 rounded-md">
            <Plus className="size-3.5 group-hover:scale-110 transition-transform" />
            <span>Add link</span>
          </Button2>
        </div>
      )}

      {uiState.isAdding && (
        <div className="border border-border rounded-xl bg-card overflow-hidden animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
            <span className="text-xs font-medium text-foreground">New Link</span>
            <button type="button" onClick={resetForm} className="p-1 rounded-md hover:bg-muted transition-colors">
              <X className="size-3.5 text-muted-foreground" />
            </button>
          </div>

          <div className="p-3 space-y-3">
            <Input value={newLink.title} onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))} placeholder="Link title" className="h-10 text-sm" />

            <Input value={newLink.description} onChange={(e) => setNewLink(prev => ({ ...prev, description: e.target.value }))} placeholder="Description (optional)" className="h-10 text-sm" />

            <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
              {typeOptions.map((type) => {
                const Icon = type.icon;
                const isActive = uiState.selectedType === type.id;

                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setUiState((prev) => ({ ...prev, selectedType: type.id }))}
                    className={`
                      flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all
                      ${isActive ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}
                    `}
                  >
                    <Icon className="size-3.5" />
                    <span className="hidden sm:inline">{type.label}</span>
                  </button>
                );
              })}
            </div>

            {uiState.selectedType === "url" && <Input value={newLink.url} onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))} placeholder="https://example.com" className="h-10 text-sm" />}

            {uiState.selectedType === "media" && (
              <div className="relative">
                <input id="media-upload" type="file" accept="image/*" onChange={handleMediaUpload} className="absolute inset-0 size-full opacity-0 cursor-pointer z-20" style={{ pointerEvents: "auto" }} />
                <label
                  htmlFor="media-upload"
                  className="h-20 rounded-lg border border-dashed border-border bg-muted/50 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden relative"
                >
                  {uiState.mediaPreview ? (
                    <Image src={uiState.mediaPreview} alt="Media" fill sizes="(max-width: 768px) 100vw, 400px" className="object-cover" unoptimized />
                  ) : (
                    <>
                      <ImageIcon className="size-5 text-muted-foreground mb-1" />
                      <span className="text-[10px] text-muted-foreground">Click to upload</span>
                    </>
                  )}
                </label>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <Button onClick={handleAdd} disabled={uiState.isSaving || !newLink.title} size="sm" className="flex-1 h-9 text-sm">
                {uiState.isSaving && <Loader2 className="size-3.5 animate-spin mr-1.5" />}
                Add Link
              </Button>
              <Button onClick={resetForm} variant="ghost" size="sm" className="h-9 text-sm" disabled={uiState.isSaving}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={profile.links?.map((l) => l.id) || []} strategy={verticalListSortingStrategy}>
            <TooltipProvider>
              {profile.links?.map((link: any) => (
                <SortableLinkItem key={link.id} link={link} onEdit={handleEdit} onDelete={handleDelete} deletingId={uiState.deletingId} />
              ))}
            </TooltipProvider>
          </SortableContext>
        </DndContext>

        {(!profile.links || profile.links.length === 0) && !uiState.isAdding && (
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center size-10 rounded-full bg-muted mb-2">
              <Link2Icon className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No links yet</p>
            <p className="text-xs text-muted-foreground/70">Add your first link above</p>
          </div>
        )}
      </div>

      <AlertDialog open={uiState.deleteDialogOpen} onOpenChange={(open) => setUiState((prev) => ({ ...prev, deleteDialogOpen: open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>This will discard all unsaved changes to this link.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline" size="sm">
              Keep editing
            </AlertDialogCancel>
            <AlertDialogAction onClick={resetForm} variant="destructive" size="sm">
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <LinkEditDialog key={uiState.editingLink?.id || "new"} link={uiState.editingLink} open={uiState.editDialogOpen} onOpenChange={(open) => setUiState((prev) => ({ ...prev, editDialogOpen: open }))} onSave={handleEditSave} />
    </div>
  );
}

const Link2Icon = LinkIcon;

interface SortableLinkItemProps {
  link: any;
  onEdit: (link: any) => void;
  onDelete: (id: string) => void;
  deletingId: string | null;
}

function SortableLinkItem({ link, onEdit, onDelete, deletingId }: SortableLinkItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div ref={setNodeRef} style={style} className="group flex items-center rounded-xl gap-2 py-3 shadow-dzenn border-none bg-card hover:border-primary/30 transition-all">
      <div {...attributes} {...listeners} className="p-1 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity touch-none">
        <GripVertical className="size-3.5 text-muted-foreground" />
      </div>

      <div className="size-10 rounded-md bg-muted flex items-center justify-center shrink-0">
        <LinkIcon className="size-4 text-muted-foreground" />
      </div>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{link.title}</p>
        {link.url && <p className="text-[10px] text-muted-foreground truncate">{link.url}</p>}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {link.url && (
          <Tooltip>
            <TooltipTrigger asChild>
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md hover:bg-muted transition-colors">
                <ExternalLink className="size-3.5 text-muted-foreground" />
              </a>
            </TooltipTrigger>
            <TooltipContent side="top">Open link</TooltipContent>
          </Tooltip>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" onClick={() => onEdit(link)} className="p-1.5 rounded-md hover:bg-muted transition-colors">
              <Pencil className="size-3.5 text-muted-foreground" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">Edit link</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" onClick={() => onDelete(link.id)} disabled={deletingId === link.id} className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors">
              {deletingId === link.id ? <Loader2 className="size-3.5 animate-spin text-muted-foreground" /> : <Trash2 className="size-3.5 text-destructive" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">Delete link</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
