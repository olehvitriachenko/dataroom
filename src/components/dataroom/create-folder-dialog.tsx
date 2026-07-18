"use client";

import { useState, type FormEvent } from "react";
import { FolderPlus } from "lucide-react";
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

interface CreateFolderDialogProps {
  dataRoomId: string;
  parentId: string | null;
}

export function CreateFolderDialog({
  dataRoomId,
  parentId,
}: CreateFolderDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName = name.trim();

    if (!normalizedName) {
      toast.error("Folder name is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const siblingFolders = await db.folders
        .where("dataRoomId")
        .equals(dataRoomId)
        .filter((folder) => folder.parentId === parentId)
        .toArray();

      const alreadyExists = siblingFolders.some(
        (folder) =>
          folder.name.toLocaleLowerCase() ===
          normalizedName.toLocaleLowerCase(),
      );

      if (alreadyExists) {
        toast.error("A folder with this name already exists.");
        return;
      }

      const now = new Date();

      await db.folders.add({
        id: crypto.randomUUID(),
        dataRoomId,
        parentId,
        name: normalizedName,
        createdAt: now,
        updatedAt: now,
      });

      setName("");
      setOpen(false);
      toast.success("Folder created.");
    } catch (e) {
      console.error(e);
      toast.error("Could not create the folder.");
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
      <DialogTrigger render={<Button size="sm" />}>
        <FolderPlus />
        New folder
      </DialogTrigger>

      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create folder</DialogTitle>

            <DialogDescription>
              Add a folder to organize documents in this data room.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2 py-6">
            <Label htmlFor="folder-name">Folder name</Label>

            <Input
              id="folder-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Financial documents"
              maxLength={80}
              autoFocus
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
              {isSubmitting ? "Creating..." : "Create folder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
