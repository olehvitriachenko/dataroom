"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { FileUp } from "lucide-react";
import { toast } from "sonner";

import { isPdfFile, uploadPdfFiles } from "@/db/file-actions";
import { Button } from "@/components/ui/button";

interface UploadPdfButtonProps {
  dataRoomId: string;
  folderId: string | null;
}

export function UploadPdfButton({ dataRoomId, folderId }: UploadPdfButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFiles(files: File[]) {
    if (files.length === 0) {
      return;
    }

    setIsUploading(true);

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
    } finally {
      setIsUploading(false);
    }
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    event.target.value = "";
    void handleFiles(files);
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        multiple
        className="hidden"
        onChange={handleChange}
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
      >
        <FileUp />
        {isUploading ? "Uploading..." : "Upload PDF"}
      </Button>
    </>
  );
}
