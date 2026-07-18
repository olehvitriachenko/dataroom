"use client";

import { type DragEvent } from "react";
import { FolderOpen } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";

import { db } from "@/db/database";
import { moveFolderToParent } from "@/db/folder-actions";
import { getDraggedFolderId, hasDraggedFolder } from "@/lib/folder-drag";
import { FolderCard } from "./folder-card";
import type { Folder } from "@/types/entities";

interface DataRoomExplorerProps {
  dataRoomId: string;
}

export function DataRoomExplorer({ dataRoomId }: DataRoomExplorerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFolderId = searchParams.get("folderId");

  function handleOpenFolder(folder: Folder) {
    router.push(`/datarooms/${dataRoomId}?folderId=${folder.id}`);
  }

  async function moveFolder(
    folderId: string,
    targetParentId: string | null,
    successMessage: string,
  ) {
    try {
      const didMove = await moveFolderToParent({
        folderId,
        targetDataRoomId: dataRoomId,
        targetParentId,
      });

      if (didMove) {
        toast.success(successMessage);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not move the folder.",
      );
    }
  }

  function handleMoveFolderToFolder(folderId: string, targetFolder: Folder) {
    void moveFolder(
      folderId,
      targetFolder.id,
      `Folder moved to ${targetFolder.name}.`,
    );
  }

  function handleRootDragOver(event: DragEvent<HTMLElement>) {
    if (!hasDraggedFolder(event.dataTransfer)) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function handleRootDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();

    const draggedFolderId = getDraggedFolderId(event.dataTransfer);

    if (!draggedFolderId) {
      return;
    }

    void moveFolder(draggedFolderId, currentFolderId, "Folder moved.");
  }

  const folders = useLiveQuery(
    () =>
      db.folders
        .where("dataRoomId")
        .equals(dataRoomId)
        .filter((folder) => folder.parentId === currentFolderId)
        .sortBy("name"),
    [dataRoomId, currentFolderId],
  );

  if (folders === undefined) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="h-20 animate-pulse rounded-xl border bg-muted"
          />
        ))}
      </div>
    );
  }
  return (
    <section onDragOver={handleRootDragOver} onDrop={handleRootDrop}>
      {folders.length === 0 ? (
        <div className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed bg-background p-8 text-center">
          <div className="mb-4 rounded-full border bg-muted p-4">
            <FolderOpen className="size-7 text-muted-foreground" />
          </div>

          <h3 className="text-lg font-semibold">This folder is empty</h3>

          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Create a folder to start organizing your documents.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {folders.map((folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              onOpen={handleOpenFolder}
              onMoveToFolder={handleMoveFolderToFolder}
            />
          ))}
        </div>
      )}
    </section>
  );
}
