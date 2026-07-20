"use client";

import { useMemo, useState, type DragEvent } from "react";
import { FolderOpen, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";

import { db } from "@/db/database";
import { isPdfFile, moveFileToFolder, uploadPdfFiles } from "@/db/file-actions";
import { moveFolderToParent } from "@/db/folder-actions";
import {
  getDraggedFileId,
  hasDraggedDataRoomFile,
  hasNativeFiles,
} from "@/lib/file-drag";
import { getDraggedFolderId, hasDraggedFolder } from "@/lib/folder-drag";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileCard } from "./file-card";
import { FolderCard } from "./folder-card";
import type { Folder } from "@/types/entities";

interface DataRoomExplorerProps {
  dataRoomId: string;
}

export function DataRoomExplorer({ dataRoomId }: DataRoomExplorerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFolderId = searchParams.get("folderId");
  const [searchQuery, setSearchQuery] = useState("");

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

  async function uploadFiles(files: File[], folderId: string | null) {
    try {
      const uploadedCount = await uploadPdfFiles({
        dataRoomId,
        folderId,
        files,
      });
      const rejectedCount = files.filter((file) => !isPdfFile(file)).length;

      if (uploadedCount > 0) {
        toast.success(
          uploadedCount === 1
            ? "PDF uploaded."
            : `${uploadedCount} PDFs uploaded.`,
        );
      }

      if (rejectedCount > 0) {
        toast.error("Only PDF files are supported.");
      }
    } catch {
      toast.error("Could not upload PDF files.");
    }
  }

  async function moveFile(
    fileId: string,
    targetFolderId: string | null,
    successMessage: string,
  ) {
    try {
      const didMove = await moveFileToFolder({
        fileId,
        targetDataRoomId: dataRoomId,
        targetFolderId,
      });

      if (didMove) {
        toast.success(successMessage);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not move the PDF.",
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

  function handleMoveFileToFolder(fileId: string, targetFolder: Folder) {
    void moveFile(fileId, targetFolder.id, `PDF moved to ${targetFolder.name}.`);
  }

  function handleRootDragOver(event: DragEvent<HTMLElement>) {
    if (
      !hasDraggedFolder(event.dataTransfer) &&
      !hasDraggedDataRoomFile(event.dataTransfer) &&
      !hasNativeFiles(event.dataTransfer)
    ) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function handleRootDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();

    const draggedFolderId = getDraggedFolderId(event.dataTransfer);
    const draggedFileId = getDraggedFileId(event.dataTransfer);

    if (event.dataTransfer.files.length > 0) {
      void uploadFiles(Array.from(event.dataTransfer.files), currentFolderId);
      return;
    }

    if (draggedFileId) {
      void moveFile(draggedFileId, currentFolderId, "PDF moved.");
      return;
    }

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
  const files = useLiveQuery(
    () =>
      db.files
        .where("dataRoomId")
        .equals(dataRoomId)
        .filter((file) => file.folderId === currentFolderId)
        .sortBy("name"),
    [dataRoomId, currentFolderId],
  );
  const filteredFolders = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase();

    if (!folders || !normalizedQuery) {
      return folders;
    }

    return folders.filter((folder) =>
      folder.name.toLocaleLowerCase().includes(normalizedQuery),
    );
  }, [folders, searchQuery]);
  const filteredFiles = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase();

    if (!files || !normalizedQuery) {
      return files;
    }

    return files.filter((file) =>
      file.name.toLocaleLowerCase().includes(normalizedQuery),
    );
  }, [files, searchQuery]);

  if (folders === undefined || files === undefined) {
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
      {folders.length === 0 && files.length === 0 ? (
        <div className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed bg-background p-8 text-center">
          <div className="mb-4 rounded-full border bg-muted p-4">
            <FolderOpen className="size-7 text-muted-foreground" />
          </div>

          <h3 className="text-lg font-semibold">This folder is empty</h3>

          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Create a folder or upload PDFs to start organizing your documents.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          <div className="relative max-w-sm">
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search folders and PDFs"
              className="bg-background pr-9"
            />

            {searchQuery ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label="Clear search"
                className="absolute top-1/2 right-1 -translate-y-1/2"
                onClick={() => setSearchQuery("")}
              >
                <X />
              </Button>
            ) : null}
          </div>

          {filteredFolders?.length === 0 && filteredFiles?.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-background p-8 text-center">
              <h3 className="text-lg font-semibold">No items found</h3>

              <p className="mt-2 text-sm text-muted-foreground">
                Try a different search term.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredFolders?.map((folder) => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  onOpen={handleOpenFolder}
                  onMoveToFolder={handleMoveFolderToFolder}
                  onMoveFileToFolder={handleMoveFileToFolder}
                  onUploadFilesToFolder={(files, targetFolder) =>
                    void uploadFiles(files, targetFolder.id)
                  }
                />
              ))}
              {filteredFiles?.map((file) => (
                <FileCard key={file.id} file={file} />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
