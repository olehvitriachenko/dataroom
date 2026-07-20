"use client";

import { useState, type DragEvent } from "react";
import { FileText, MoreVertical } from "lucide-react";

import type { DataRoomFile } from "@/types/entities";

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
import { setDraggedFileId } from "@/lib/file-drag";
import { formatFileDate, formatFileSize } from "@/lib/file-format";
import { DeleteFileDialog } from "./delete-file-dialog";
import {
  FileContextMenuContent,
  FileDropdownMenuContent,
} from "./file-actions-menu";
import { PdfPreviewDialog } from "./pdf-preview-dialog";
import { RenameFileDialog } from "./rename-file-dialog";

interface FileCardProps {
  file: DataRoomFile;
}

export function FileCard({ file }: FileCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  function handleDragStart(event: DragEvent<HTMLElement>) {
    setDraggedFileId(event.dataTransfer, file.id);
  }

  function openRenameDialog() {
    window.setTimeout(() => setIsRenameOpen(true), 0);
  }

  function openDeleteDialog() {
    window.setTimeout(() => setIsDeleteOpen(true), 0);
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger
          render={
            <article
              draggable
              onDragStart={handleDragStart}
              className="group relative flex min-h-32 flex-col justify-between rounded-xl border bg-card p-4 transition-colors hover:bg-accent/40 focus-within:bg-accent/40"
            />
          }
        >
          <button
            type="button"
            className="absolute inset-0 rounded-xl text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-label={`Preview ${file.name}`}
            onClick={() => setIsPreviewOpen(true)}
          />

          <div className="pointer-events-none flex size-10 items-center justify-center rounded-lg bg-muted">
            <FileText className="size-5 text-muted-foreground" />
          </div>

          <div className="pointer-events-none min-w-0">
            <h3 className="truncate font-medium">{file.name}</h3>

            <p className="mt-1 text-xs text-muted-foreground">
              PDF · {formatFileSize(file.size)}
            </p>

            <p className="mt-1 truncate text-xs text-muted-foreground">
              Uploaded {formatFileDate(file.createdAt)}
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
                    aria-label={`Open actions for ${file.name}`}
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
                <FileDropdownMenuContent
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
          <FileContextMenuContent
            onRename={openRenameDialog}
            onDelete={openDeleteDialog}
          />
        </ContextMenuContent>
      </ContextMenu>

      {isPreviewOpen ? (
        <PdfPreviewDialog
          file={file}
          open={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
        />
      ) : null}

      <RenameFileDialog
        file={file}
        open={isRenameOpen}
        onOpenChange={setIsRenameOpen}
      />

      <DeleteFileDialog
        file={file}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
      />
    </>
  );
}
