import { db } from "@/db/database";

export async function deleteDataRoom(dataRoomId: string): Promise<void> {
  await db.transaction("rw", db.dataRooms, db.folders, db.files, async () => {
    const folders = await db.folders
      .where("dataRoomId")
      .equals(dataRoomId)
      .toArray();
    const files = await db.files.where("dataRoomId").equals(dataRoomId).toArray();

    await db.files.bulkDelete(files.map((file) => file.id));
    await db.folders.bulkDelete(folders.map((folder) => folder.id));
    await db.dataRooms.delete(dataRoomId);
  });
}
