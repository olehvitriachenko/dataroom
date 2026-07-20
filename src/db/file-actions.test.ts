import { beforeEach, describe, expect, it } from "vitest";

import { db } from "@/db/database";
import { moveFileToFolder, uploadPdfFiles } from "@/db/file-actions";

async function resetDatabase() {
  await db.delete();
  await db.open();
}

function pdfFile(name: string) {
  return new File(["%PDF-1.4"], name, { type: "application/pdf" });
}

function textFile(name: string) {
  return new File(["hello"], name, { type: "text/plain" });
}

describe("file actions", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("uploads only PDFs and assigns unique display names within a folder", async () => {
    const uploadedCount = await uploadPdfFiles({
      dataRoomId: "room-1",
      folderId: "folder-1",
      files: [
        pdfFile("contract.pdf"),
        pdfFile("contract.pdf"),
        textFile("notes.txt"),
      ],
    });

    const files = await db.files.orderBy("createdAt").toArray();

    expect(uploadedCount).toBe(2);
    expect(files.map((file) => file.name).sort()).toEqual([
      "contract",
      "contract (1)",
    ]);
    expect(files.every((file) => file.mimeType === "application/pdf")).toBe(true);
  });

  it("does not report a move when the file already belongs to the target folder", async () => {
    await uploadPdfFiles({
      dataRoomId: "room-1",
      folderId: "folder-1",
      files: [pdfFile("deck.pdf")],
    });

    const file = await db.files.toCollection().first();
    const didMove = await moveFileToFolder({
      fileId: file!.id,
      targetDataRoomId: "room-1",
      targetFolderId: "folder-1",
    });

    expect(didMove).toBe(false);
  });

  it("moves a file to another folder", async () => {
    await uploadPdfFiles({
      dataRoomId: "room-1",
      folderId: "folder-1",
      files: [pdfFile("deck.pdf")],
    });

    const file = await db.files.toCollection().first();
    const didMove = await moveFileToFolder({
      fileId: file!.id,
      targetDataRoomId: "room-2",
      targetFolderId: null,
    });
    const movedFile = await db.files.get(file!.id);

    expect(didMove).toBe(true);
    expect(movedFile?.dataRoomId).toBe("room-2");
    expect(movedFile?.folderId).toBeNull();
  });
});
