import Dexie, { type EntityTable } from "dexie";

import type { DataRoom, DataRoomFile, Folder } from "@/types/entities";

class DataRoomDatabase extends Dexie {
  dataRooms!: EntityTable<DataRoom, "id">;
  folders!: EntityTable<Folder, "id">;
  files!: EntityTable<DataRoomFile, "id">;

  constructor() {
    super("dataroom-db");

    this.version(1).stores({
      dataRooms: "id, name, createdAt, updatedAt",
      folders:
        "id, dataRoomId, parentId, [dataRoomId+parentId], name, createdAt",
      files: "id, dataRoomId, folderId, [dataRoomId+folderId], name, createdAt",
    });
  }
}

export const db = new DataRoomDatabase();
