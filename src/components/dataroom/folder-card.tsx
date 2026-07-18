"use client";

import { useState, type DragEvent } from "react";
import { FolderIcon, MoreVertical } from "lucide-react";

import type { Folder } from "@/types/entities";

import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteFolderDialog } from "./delete-folder-dialog";
import {
  FolderContextMenuContent,
  FolderDropdownMenuContent,
} from "./folder-actions-menu";
import { RenameFolderDialog } from "./rename-folder-dialog";
import {
  getDraggedFolderId,
  hasDraggedFolder,
  setDraggedFolderId,
} from "@/lib/folder-drag";
import { cn } from "@/lib/utils";

interface FolderCardProps {
  folder: Folder;
  onOpen: (folder: Folder) => void;
  onMoveToFolder?: (folderId: string, targetFolder: Folder) => void;
}

export function FolderCard({
  folder,
  onOpen,
  onMoveToFolder,
}: FolderCardProps) {
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  function handleOpen() {
    onOpen(folder);
  }

  function openRenameDialog() {
    window.setTimeout(() => setIsRenameOpen(true), 0);
  }

  function openDeleteDialog() {
    window.setTimeout(() => setIsDeleteOpen(true), 0);
  }

  function handleDragStart(event: DragEvent<HTMLElement>) {
    setDraggedFolderId(event.dataTransfer, folder.id);
  }

  function handleDragOver(event: DragEvent<HTMLElement>) {
    if (!onMoveToFolder || !hasDraggedFolder(event.dataTransfer)) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setIsDraggingOver(true);
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    if (!onMoveToFolder) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(false);

    const draggedFolderId = getDraggedFolderId(event.dataTransfer);

    if (!draggedFolderId || draggedFolderId === folder.id) {
      return;
    }

    onMoveToFolder(draggedFolderId, folder);
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger
          render={
            <article
              draggable
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragLeave={() => setIsDraggingOver(false)}
              onDrop={handleDrop}
              className={cn(
                "group relative flex min-h-32 flex-col justify-between rounded-xl border bg-card p-4 transition-colors hover:bg-accent/40 focus-within:bg-accent/40",
                isDraggingOver &&
                  "border-primary bg-primary/5 ring-2 ring-primary/25",
              )}
            />
          }
        >
          <button
            type="button"
            className="absolute inset-0 rounded-xl text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-label={`Open folder ${folder.name}`}
            onClick={handleOpen}
          />

          <div className="pointer-events-none flex items-start justify-between gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <FolderIcon className="size-5" />
            </div>
          </div>

          <div className="pointer-events-none relative min-w-0">
            <h3 className="truncate font-medium">{folder.name}</h3>

            <p className="mt-1 text-xs text-muted-foreground">Folder</p>
          </div>

          <div
            className="absolute top-3 right-3 z-10 opacity-100 md:opacity-0 md:transition-opacity md:group-hover:opacity-100 md:group-focus-within:opacity-100"
            onClick={(event) => event.stopPropagation()}
            onContextMenu={(event) => event.stopPropagation()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Open actions for ${folder.name}`}
                  />
                }
              >
                <MoreVertical />
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-36"
                onClick={(event) => event.stopPropagation()}
              >
                <FolderDropdownMenuContent
                  onRename={openRenameDialog}
                  onDelete={openDeleteDialog}
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </ContextMenuTrigger>

        <ContextMenuContent
          className="w-36"
          onClick={(event) => event.stopPropagation()}
        >
          <FolderContextMenuContent
            onRename={openRenameDialog}
            onDelete={openDeleteDialog}
          />
        </ContextMenuContent>
      </ContextMenu>

      <RenameFolderDialog
        folder={folder}
        open={isRenameOpen}
        onOpenChange={setIsRenameOpen}
      />

      <DeleteFolderDialog
        folder={folder}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
      />
    </>
  );
}
