"use client";

import { useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { Building2, MoreVertical } from "lucide-react";

import type { DataRoom } from "@/types/entities";

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
import {
  DataRoomContextMenuContent,
  DataRoomDropdownMenuContent,
} from "./data-room-actions-menu";
import { DeleteDataRoomDialog } from "./delete-data-room-dialog";
import { RenameDataRoomDialog } from "./rename-data-room-dialog";
import {
  getDraggedFileId,
  hasDraggedDataRoomFile,
  hasNativeFiles,
} from "@/lib/file-drag";
import { getDraggedFolderId, hasDraggedFolder } from "@/lib/folder-drag";
import { cn } from "@/lib/utils";

interface CardDataRoomProps {
  room: DataRoom;
  onMoveFolderToRoom?: (folderId: string, room: DataRoom) => void;
  onMoveFileToRoom?: (fileId: string, room: DataRoom) => void;
  onUploadFilesToRoom?: (files: File[], room: DataRoom) => void;
}

export default function CardDataRoom({
  room,
  onMoveFolderToRoom,
  onMoveFileToRoom,
  onUploadFilesToRoom,
}: CardDataRoomProps) {
  const router = useRouter();
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  function handleOpen() {
    router.push(`/datarooms/${room.id}`);
  }

  function openRenameDialog() {
    window.setTimeout(() => setIsRenameOpen(true), 0);
  }

  function openDeleteDialog() {
    window.setTimeout(() => setIsDeleteOpen(true), 0);
  }

  function handleDragOver(event: DragEvent<HTMLElement>) {
    const acceptsFolder =
      onMoveFolderToRoom && hasDraggedFolder(event.dataTransfer);
    const acceptsFile =
      onMoveFileToRoom && hasDraggedDataRoomFile(event.dataTransfer);
    const acceptsUpload = onUploadFilesToRoom && hasNativeFiles(event.dataTransfer);

    if (!acceptsFolder && !acceptsFile && !acceptsUpload) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setIsDraggingOver(true);
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(false);

    const draggedFolderId = getDraggedFolderId(event.dataTransfer);
    const draggedFileId = getDraggedFileId(event.dataTransfer);

    if (event.dataTransfer.files.length > 0 && onUploadFilesToRoom) {
      onUploadFilesToRoom(Array.from(event.dataTransfer.files), room);
      return;
    }

    if (draggedFileId && onMoveFileToRoom) {
      onMoveFileToRoom(draggedFileId, room);
      return;
    }

    if (!draggedFolderId || !onMoveFolderToRoom) {
      return;
    }

    onMoveFolderToRoom(draggedFolderId, room);
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger
          render={
            <article
              onDragOver={handleDragOver}
              onDragLeave={() => setIsDraggingOver(false)}
              onDrop={handleDrop}
              className={cn(
                "group relative flex min-h-40 flex-col justify-between rounded-xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md focus-within:border-foreground/20 focus-within:shadow-md",
                isDraggingOver &&
                  "border-primary bg-primary/5 ring-2 ring-primary/25",
              )}
            />
          }
        >
          <button
            type="button"
            className="absolute inset-0 rounded-xl text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-label={`Open data room ${room.name}`}
            onClick={handleOpen}
          />

          <div className="pointer-events-none flex items-start justify-between gap-3">
            <div className="flex size-11 items-center justify-center rounded-lg bg-muted">
              <Building2 className="size-5" />
            </div>
          </div>

          <div className="pointer-events-none relative min-w-0">
            <h2 className="truncate font-semibold">{room.name}</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Created {room.createdAt.toLocaleDateString()}
            </p>
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
                    aria-label={`Open actions for ${room.name}`}
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
                <DataRoomDropdownMenuContent
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
          <DataRoomContextMenuContent
            onRename={openRenameDialog}
            onDelete={openDeleteDialog}
          />
        </ContextMenuContent>
      </ContextMenu>

      <RenameDataRoomDialog
        room={room}
        open={isRenameOpen}
        onOpenChange={setIsRenameOpen}
      />

      <DeleteDataRoomDialog
        room={room}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
      />
    </>
  );
}
