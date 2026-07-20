"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Download } from "lucide-react";

import type { DataRoomFile } from "@/types/entities";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatFileDate, formatFileSize } from "@/lib/file-format";

const PdfPreviewDocument = dynamic(
  () =>
    import("./pdf-preview-document").then(
      (module) => module.PdfPreviewDocument,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-80 items-center justify-center text-sm text-muted-foreground">
        Loading PDF...
      </div>
    ),
  },
);

interface PdfPreviewDialogProps {
  file: DataRoomFile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PdfPreviewDialog({
  file,
  open,
  onOpenChange,
}: PdfPreviewDialogProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageWidth, setPageWidth] = useState<number | null>(null);

  function handleDownload() {
    const objectUrl = URL.createObjectURL(file.blob);
    const link = document.createElement("a");

    link.href = objectUrl;
    link.download = file.originalName || `${file.name}.pdf`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  }

  const updatePageWidth = useCallback(() => {
    if (!previewRef.current) {
      return;
    }

    const measuredWidth = Math.floor(previewRef.current.clientWidth);

    setPageWidth(measuredWidth > 0 ? Math.min(measuredWidth, 900) : null);
  }, []);

  const setPreviewElement = useCallback(
    (element: HTMLDivElement | null) => {
      previewRef.current = element;

      if (element) {
        requestAnimationFrame(updatePageWidth);
      }
    },
    [updatePageWidth],
  );

  useEffect(() => {
    if (!open || !previewRef.current) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      const measuredWidth = Math.floor(
        entry.contentRect.width || previewRef.current?.clientWidth || 0,
      );

      setPageWidth(measuredWidth > 0 ? Math.min(measuredWidth, 900) : null);
    });

    updatePageWidth();
    observer.observe(previewRef.current);

    return () => observer.disconnect();
  }, [open, updatePageWidth]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="grid-rows-[auto_auto_minmax(0,1fr)] gap-0 overflow-hidden max-sm:top-0 max-sm:left-0 max-sm:h-dvh max-sm:max-h-dvh max-sm:w-screen max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-none max-sm:p-0 sm:h-[min(900px,calc(100dvh-1rem))] sm:max-w-5xl sm:gap-3 sm:p-4"
        onClick={(event) => event.stopPropagation()}
      >
        <DialogHeader className="border-b bg-popover px-4 py-3 sm:border-0 sm:p-0">
          <DialogTitle className="truncate pr-10 text-base sm:text-base">
            {file.name}
          </DialogTitle>

          <DialogDescription className="text-xs sm:text-sm">
            {file.originalName} · {formatFileSize(file.size)} · Uploaded{" "}
            {formatFileDate(file.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-row items-center justify-between border-b bg-popover px-4 py-2 sm:rounded-b-xl sm:border-b-0 sm:border-t">
          <p className="text-xs text-muted-foreground sm:text-sm">
            {pageCount > 0
              ? `${pageCount} ${pageCount === 1 ? "page" : "pages"}`
              : " "}
          </p>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownload}
          >
            <Download data-icon="inline-start" />
            Download
          </Button>
        </DialogFooter>

        <div
          ref={setPreviewElement}
          className="min-h-0 min-w-0 overflow-y-auto overflow-x-hidden bg-muted/30 p-2 sm:rounded-lg sm:border sm:p-4 [&_.react-pdf__Document]:mx-auto [&_.react-pdf__Document]:grid [&_.react-pdf__Document]:max-w-full [&_.react-pdf__Document]:justify-items-center [&_.react-pdf__Page]:relative [&_.react-pdf__Page]:mx-auto [&_.react-pdf__Page]:max-w-full [&_.react-pdf__Page]:overflow-hidden [&_.react-pdf__Page__annotations]:max-w-full [&_.react-pdf__Page__canvas]:block [&_.react-pdf__Page__canvas]:h-auto [&_.react-pdf__Page__canvas]:max-w-full [&_.react-pdf__Page__textContent]:max-w-full"
        >
          {pageWidth ? (
            <PdfPreviewDocument
              file={file.blob}
              pageCount={pageCount}
              pageWidth={pageWidth}
              onLoadSuccess={setPageCount}
            />
          ) : (
            <div className="flex min-h-80 items-center justify-center text-sm text-muted-foreground">
              Preparing preview...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
