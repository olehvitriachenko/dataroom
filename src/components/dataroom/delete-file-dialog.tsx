"use client";

import { useState } from "react";
import { toast } from "sonner";

import { deleteFile } from "@/db/file-actions";
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

interface DeleteFileDialogProps {
  file: DataRoomFile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteFileDialog({
  file,
  open,
  onOpenChange,
}: DeleteFileDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteFile(file.id);

      toast.success("PDF deleted");
      onOpenChange(false);
    } catch {
      toast.error("Failed to delete PDF");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClick={(event) => event.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Delete PDF?</DialogTitle>

          <DialogDescription>
            The PDF <span className="font-medium">{file.name}</span> will be
            permanently deleted. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="destructive"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
