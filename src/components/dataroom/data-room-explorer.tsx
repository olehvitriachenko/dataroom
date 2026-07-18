"use client";

import { FolderOpen } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";

import { db } from "@/db/database";
import FolderCard from "@/components/dataroom/folder-card";

interface DataRoomExplorerProps {
  dataRoomId: string;
}

export function DataRoomExplorer({ dataRoomId }: DataRoomExplorerProps) {
  const searchParams = useSearchParams();
  const currentFolderId = searchParams.get("folderId");

  const folders = useLiveQuery(
    () =>
      db.folders
        .where("dataRoomId")
        .equals(dataRoomId)
        .filter((folder) => folder.parentId === currentFolderId)
        .sortBy("name"),
    [dataRoomId, currentFolderId],
  );

  if (folders === undefined) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="h-20 animate-pulse rounded-xl border bg-muted"
          />
        ))}
      </div>
    );
  }
  return (
    <section>
      {folders.length === 0 ? (
        <div className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed bg-background p-8 text-center">
          <div className="mb-4 rounded-full border bg-muted p-4">
            <FolderOpen className="size-7 text-muted-foreground" />
          </div>

          <h3 className="text-lg font-semibold">This folder is empty</h3>

          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Create a folder to start organizing your documents.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {folders.map((folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              dataRoomId={dataRoomId}
            />
          ))}
        </div>
      )}
    </section>
  );
}
