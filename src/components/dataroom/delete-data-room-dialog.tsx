"use client";

import { useState } from "react";
import { toast } from "sonner";

import { deleteDataRoom } from "@/db/data-room-actions";
import type { DataRoom } from "@/types/entities";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteDataRoomDialogProps {
  room: DataRoom;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteDataRoomDialog({
  room,
  open,
  onOpenChange,
}: DeleteDataRoomDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteDataRoom(room.id);

      toast.success("Data room deleted");
      onOpenChange(false);
    } catch {
      toast.error("Failed to delete data room");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClick={(event) => event.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Delete data room?</DialogTitle>

          <DialogDescription>
            The data room <span className="font-medium">{room.name}</span>, all
            folders, and all documents inside it will be permanently deleted.
            This action cannot be undone.
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
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
