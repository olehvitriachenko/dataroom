"use client";

import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface PdfPreviewDocumentProps {
  file: Blob;
  pageCount: number;
  pageWidth: number;
  onLoadSuccess: (pageCount: number) => void;
}

export function PdfPreviewDocument({
  file,
  pageCount,
  pageWidth,
  onLoadSuccess,
}: PdfPreviewDocumentProps) {
  return (
    <Document
      file={file}
      loading={
        <div className="flex min-h-80 items-center justify-center text-sm text-muted-foreground">
          Loading PDF...
        </div>
      }
      error={
        <div className="flex min-h-80 items-center justify-center text-sm text-destructive">
          Could not load this PDF.
        </div>
      }
      onLoadSuccess={({ numPages }) => onLoadSuccess(numPages)}
    >
      <div className="grid gap-4">
        {Array.from({ length: pageCount }, (_, index) => (
          <Page key={index + 1} pageNumber={index + 1} width={pageWidth} />
        ))}
      </div>
    </Document>
  );
}
