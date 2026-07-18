"use client";

import { useState, type DragEvent } from "react";
import { FileText } from "lucide-react";

import type { DataRoomFile } from "@/types/entities";

import { setDraggedFileId } from "@/lib/file-drag";
import { PdfPreviewDialog } from "./pdf-preview-dialog";

interface FileCardProps {
  file: DataRoomFile;
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export function FileCard({ file }: FileCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  function handleDragStart(event: DragEvent<HTMLElement>) {
    setDraggedFileId(event.dataTransfer, file.id);
  }

  return (
    <>
      <article
        draggable
        onDragStart={handleDragStart}
        className="group relative flex min-h-32 flex-col justify-between rounded-xl border bg-card p-4 transition-colors hover:bg-accent/40 focus-within:bg-accent/40"
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
        </div>
      </article>

      {isPreviewOpen ? (
        <PdfPreviewDialog
          file={file}
          open={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
        />
      ) : null}
    </>
  );
}
