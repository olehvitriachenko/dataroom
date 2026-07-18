"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";

import { db } from "@/db/database";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RenameDataRoomDialogProps {
  room: DataRoom;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RenameDataRoomDialog({
  room,
  open,
  onOpenChange,
}: RenameDataRoomDialogProps) {
  const [name, setName] = useState(room.name);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setName(room.name);
    }

    onOpenChange(nextOpen);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName = name.trim();

    if (!normalizedName) {
      toast.error("Data room name is required");
      return;
    }

    if (normalizedName === room.name) {
      handleOpenChange(false);
      return;
    }

    setIsSubmitting(true);

    try {
      await db.dataRooms.update(room.id, {
        name: normalizedName,
        updatedAt: new Date(),
      });

      toast.success("Data room renamed");
      handleOpenChange(false);
    } catch {
      toast.error("Failed to rename data room");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent onClick={(event) => event.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Rename data room</DialogTitle>

            <DialogDescription>
              Enter a new name for this data room.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <Label htmlFor={`rename-data-room-${room.id}`}>Name</Label>

            <Input
              id={`rename-data-room-${room.id}`}
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
