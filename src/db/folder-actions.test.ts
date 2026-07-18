import { beforeEach, describe, expect, it } from "vitest";

import { db } from "@/db/database";
import { deleteFolderTree, moveFolderToParent } from "@/db/folder-actions";

async function resetDatabase() {
  await db.delete();
  await db.open();
}

async function addFolder(id: string, parentId: string | null, dataRoomId = "room-1") {
  const now = new Date();

  await db.folders.add({
    id,
    dataRoomId,
    parentId,
    name: id,
    createdAt: now,
    updatedAt: now,
  });
}

async function addFile(id: string, folderId: string | null, dataRoomId = "room-1") {
  const now = new Date();

  await db.files.add({
    id,
    dataRoomId,
    folderId,
    name: id,
    originalName: `${id}.pdf`,
    mimeType: "application/pdf",
    size: 10,
    blob: new Blob(["%PDF-1.4"], { type: "application/pdf" }),
    createdAt: now,
    updatedAt: now,
  });
}

describe("folder actions", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("deletes nested folders and files in the folder tree", async () => {
    await addFolder("parent", null);
    await addFolder("child", "parent");
    await addFolder("sibling", null);
    await addFile("parent-file", "parent");
    await addFile("child-file", "child");
    await addFile("sibling-file", "sibling");

    await deleteFolderTree("parent");

    expect(await db.folders.get("parent")).toBeUndefined();
    expect(await db.folders.get("child")).toBeUndefined();
    expect(await db.files.get("parent-file")).toBeUndefined();
    expect(await db.files.get("child-file")).toBeUndefined();
    expect(await db.folders.get("sibling")).toBeDefined();
    expect(await db.files.get("sibling-file")).toBeDefined();
  });

  it("prevents moving a folder into one of its descendants", async () => {
    await addFolder("parent", null);
    await addFolder("child", "parent");

    await expect(
      moveFolderToParent({
        folderId: "parent",
        targetDataRoomId: "room-1",
        targetParentId: "child",
      }),
    ).rejects.toThrow("A folder cannot be moved into one of its subfolders.");
  });
});
