import { db } from "@/db/database";

async function collectFolderTreeIds(folderId: string): Promise<string[]> {
  const folderIds = [folderId];
  const pendingFolderIds = [folderId];

  while (pendingFolderIds.length > 0) {
    const parentId = pendingFolderIds.shift();

    if (!parentId) {
      continue;
    }

    const children = await db.folders
      .where("parentId")
      .equals(parentId)
      .toArray();

    for (const child of children) {
      folderIds.push(child.id);
      pendingFolderIds.push(child.id);
    }
  }

  return folderIds;
}

export async function deleteFolderTree(folderId: string): Promise<void> {
  await db.transaction("rw", db.folders, db.files, async () => {
    const folderIds = await collectFolderTreeIds(folderId);
    const folderIdSet = new Set(folderIds);
    const files = await db.files
      .filter((file) => Boolean(file.folderId && folderIdSet.has(file.folderId)))
      .toArray();

    await db.files.bulkDelete(files.map((file) => file.id));
    await db.folders.bulkDelete(folderIds);
  });
}

export async function moveFolderToParent({
  folderId,
  targetDataRoomId,
  targetParentId,
}: {
  folderId: string;
  targetDataRoomId: string;
  targetParentId: string | null;
}): Promise<boolean> {
  return db.transaction("rw", db.folders, db.files, async () => {
    const folder = await db.folders.get(folderId);

    if (!folder) {
      throw new Error("Folder was not found.");
    }

    let nextDataRoomId = targetDataRoomId;

    if (targetParentId) {
      const targetFolder = await db.folders.get(targetParentId);

      if (!targetFolder) {
        throw new Error("Target folder was not found.");
      }

      nextDataRoomId = targetFolder.dataRoomId;
    }

    if (folder.id === targetParentId) {
      throw new Error("A folder cannot be moved into itself.");
    }

    const folderTreeIds = await collectFolderTreeIds(folderId);

    if (targetParentId && folderTreeIds.includes(targetParentId)) {
      throw new Error("A folder cannot be moved into one of its subfolders.");
    }

    if (
      folder.parentId === targetParentId &&
      folder.dataRoomId === nextDataRoomId
    ) {
      return false;
    }

    const now = new Date();
    const folderTreeIdSet = new Set(folderTreeIds);
    const filesInTree = await db.files
      .filter((file) => Boolean(file.folderId && folderTreeIdSet.has(file.folderId)))
      .toArray();

    await Promise.all([
      db.folders.update(folderId, {
        parentId: targetParentId,
        dataRoomId: nextDataRoomId,
        updatedAt: now,
      }),
      ...folderTreeIds
        .filter((id) => id !== folderId)
        .map((id) =>
          db.folders.update(id, {
            dataRoomId: nextDataRoomId,
            updatedAt: now,
          }),
        ),
      ...filesInTree.map((file) =>
        db.files.update(file.id, {
          dataRoomId: nextDataRoomId,
          updatedAt: now,
        }),
      ),
    ]);

    return true;
  });
}
