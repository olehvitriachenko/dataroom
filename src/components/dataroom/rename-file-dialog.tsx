"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";

import { db } from "@/db/database";
import type { DataRoomFile } from "@/types/entities";

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

interface RenameFileDialogProps {
  file: DataRoomFile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RenameFileDialog({
  file,
  open,
  onOpenChange,
}: RenameFileDialogProps) {
  const [name, setName] = useState(file.name);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setName(file.name);
    }

    onOpenChange(nextOpen);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName = name.trim();

    if (!normalizedName) {
      toast.error("File name is required");
      return;
    }

    if (normalizedName === file.name) {
      handleOpenChange(false);
      return;
    }

    setIsSubmitting(true);

    try {
      const siblingFiles = await db.files
        .where("dataRoomId")
        .equals(file.dataRoomId)
        .filter((siblingFile) => siblingFile.folderId === file.folderId)
        .toArray();
      const alreadyExists = siblingFiles.some(
        (siblingFile) =>
          siblingFile.id !== file.id &&
          siblingFile.name.toLocaleLowerCase() ===
            normalizedName.toLocaleLowerCase(),
      );

      if (alreadyExists) {
        toast.error("A PDF with this name already exists.");
        return;
      }

      await db.files.update(file.id, {
        name: normalizedName,
        updatedAt: new Date(),
      });

      toast.success("PDF renamed");
      handleOpenChange(false);
    } catch {
      toast.error("Failed to rename PDF");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent onClick={(event) => event.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Rename PDF</DialogTitle>

            <DialogDescription>Enter a new name for this PDF.</DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <Label htmlFor={`rename-file-${file.id}`}>File name</Label>

            <Input
              id={`rename-file-${file.id}`}
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
