"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";

import { db } from "@/db/database";
import type { Folder } from "@/types/entities";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RenameFolderDialogProps {
  folder: Folder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RenameFolderDialog({
  folder,
  open,
  onOpenChange,
}: RenameFolderDialogProps) {
  const [name, setName] = useState(folder.name);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setName(folder.name);
    }

    onOpenChange(nextOpen);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName = name.trim();

    if (!normalizedName) {
      toast.error("Folder name is required");
      return;
    }

    if (normalizedName === folder.name) {
      handleOpenChange(false);
      return;
    }

    setIsSubmitting(true);

    try {
      await db.folders.update(folder.id, {
        name: normalizedName,
      });

      toast.success("Folder renamed");
      handleOpenChange(false);
    } catch {
      toast.error("Failed to rename folder");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent onClick={(event) => event.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Rename folder</DialogTitle>

            <DialogDescription>
              Enter a new name for this folder.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <Label htmlFor={`rename-folder-${folder.id}`}>Folder name</Label>

            <Input
              id={`rename-folder-${folder.id}`}
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2"
              disabled={isSubmitting}
              autoFocus
              maxLength={100}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
