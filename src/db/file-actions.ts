import { db } from "@/db/database";

interface UploadPdfFilesInput {
  dataRoomId: string;
  folderId: string | null;
  files: File[];
}

export function isPdfFile(file: File) {
  return (
    file.type === "application/pdf" ||
    file.name.toLocaleLowerCase().endsWith(".pdf")
  );
}

export async function uploadPdfFiles({
  dataRoomId,
  folderId,
  files,
}: UploadPdfFilesInput): Promise<number> {
  const pdfFiles = files.filter(isPdfFile);

  if (pdfFiles.length === 0) {
    return 0;
  }

  const now = new Date();
  const siblingFiles = await db.files
    .where("dataRoomId")
    .equals(dataRoomId)
    .filter((file) => file.folderId === folderId)
    .toArray();
  const usedNames = new Set(
    siblingFiles.map((file) => file.name.toLocaleLowerCase()),
  );

  await db.files.bulkAdd(
    pdfFiles.map((file) => {
      const name = getUniqueFileName(file.name.replace(/\.pdf$/i, ""), usedNames);

      usedNames.add(name.toLocaleLowerCase());

      return {
        id: crypto.randomUUID(),
        dataRoomId,
        folderId,
        name,
        originalName: file.name,
        mimeType: "application/pdf" as const,
        size: file.size,
        blob: file,
        createdAt: now,
        updatedAt: now,
      };
    }),
  );

  return pdfFiles.length;
}

function getUniqueFileName(baseName: string, usedNames: Set<string>) {
  const normalizedBaseName = baseName.trim() || "Untitled PDF";
  let nextName = normalizedBaseName;
  let suffix = 1;

  while (usedNames.has(nextName.toLocaleLowerCase())) {
    nextName = `${normalizedBaseName} (${suffix})`;
    suffix += 1;
  }

  return nextName;
}

export async function moveFileToFolder({
  fileId,
  targetDataRoomId,
  targetFolderId,
}: {
  fileId: string;
  targetDataRoomId: string;
  targetFolderId: string | null;
}): Promise<boolean> {
  return db.transaction("rw", db.files, async () => {
    const file = await db.files.get(fileId);

    if (!file) {
      throw new Error("File was not found.");
    }

    if (
      file.folderId === targetFolderId &&
      file.dataRoomId === targetDataRoomId
    ) {
      return false;
    }

    await db.files.update(fileId, {
      dataRoomId: targetDataRoomId,
      folderId: targetFolderId,
      updatedAt: new Date(),
    });

    return true;
  });
}

export async function deleteFile(fileId: string): Promise<void> {
  await db.files.delete(fileId);
}
