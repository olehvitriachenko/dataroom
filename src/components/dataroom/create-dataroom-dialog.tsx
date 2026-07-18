"use client";

import { FormEvent, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { db } from "@/db/database";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateDataRoomDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName = name.trim();

    if (!normalizedName) {
      toast.error("Data room name is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const existingRoom = await db.dataRooms
        .filter(
          (room) =>
            room.name.toLocaleLowerCase() ===
            normalizedName.toLocaleLowerCase(),
        )
        .first();

      if (existingRoom) {
        toast.error("A data room with this name already exists.");
        return;
      }

      const now = new Date();

      await db.dataRooms.add({
        id: crypto.randomUUID(),
        name: normalizedName,
        createdAt: now,
        updatedAt: now,
      });

      setName("");
      setOpen(false);
      toast.success("Data room created.");
    } catch {
      toast.error("Could not create the data room.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) {
      setName("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button>
            <Plus />
            New data room
          </Button>
        }
      />

      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create data room</DialogTitle>
            <DialogDescription>
              Create a secure space for organizing due diligence documents.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2 py-6">
            <Label htmlFor="data-room-name">Name</Label>
            <Input
              id="data-room-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Acme acquisition"
              autoFocus
              maxLength={80}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? "Creating..." : "Create data room"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
