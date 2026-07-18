"use client";

import { useMemo, useState } from "react";
import { FolderOpen } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";

import { db } from "@/db/database";
import {
  isPdfFile,
  moveFileToFolder,
  uploadPdfFiles,
} from "@/db/file-actions";
import { moveFolderToParent } from "@/db/folder-actions";
import { Input } from "@/components/ui/input";
import type { DataRoom } from "@/types/entities";
import CardDataRoom from "./dataroom-card";
// import { CreateDataRoomDialog } from "@/components/dataroom/create-dataroom-dialog";

export function DataRoomList() {
  const [searchQuery, setSearchQuery] = useState("");
  const dataRooms = useLiveQuery(
    () => db.dataRooms.orderBy("createdAt").reverse().toArray(),
    [],
  );
  const filteredDataRooms = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase();

    if (!dataRooms || !normalizedQuery) {
      return dataRooms;
    }

    return dataRooms.filter((room) =>
      room.name.toLocaleLowerCase().includes(normalizedQuery),
    );
  }, [dataRooms, searchQuery]);

  async function handleMoveFolderToRoom(folderId: string, room: DataRoom) {
    try {
      const didMove = await moveFolderToParent({
        folderId,
        targetDataRoomId: room.id,
        targetParentId: null,
      });

      if (didMove) {
        toast.success(`Folder moved to ${room.name}.`);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not move the folder.",
      );
    }
  }

  async function handleMoveFileToRoom(fileId: string, room: DataRoom) {
    try {
      const didMove = await moveFileToFolder({
        fileId,
        targetDataRoomId: room.id,
        targetFolderId: null,
      });

      if (didMove) {
        toast.success(`PDF moved to ${room.name}.`);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not move the PDF.",
      );
    }
  }

  async function handleUploadFilesToRoom(files: File[], room: DataRoom) {
    try {
      const uploadedCount = await uploadPdfFiles({
        dataRoomId: room.id,
        folderId: null,
        files,
      });
      const rejectedCount = files.filter((file) => !isPdfFile(file)).length;

      if (uploadedCount > 0) {
        toast.success(
          uploadedCount === 1
            ? `PDF uploaded to ${room.name}.`
            : `${uploadedCount} PDFs uploaded to ${room.name}.`,
        );
      }

      if (rejectedCount > 0) {
        toast.error("Only PDF files are supported.");
      }
    } catch {
      toast.error("Could not upload PDF files.");
    }
  }

  if (dataRooms === undefined) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="h-40 animate-pulse rounded-xl border bg-muted"
          />
        ))}
      </div>
    );
  }

  if (dataRooms.length === 0) {
    return (
      <section className="flex min-h-96 flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 p-8 text-center">
        <div className="mb-4 rounded-full border bg-background p-4">
          <FolderOpen className="size-7 text-muted-foreground" />
        </div>

        <h2 className="text-lg font-semibold">No data rooms yet</h2>

        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Create your first data room to organize and review acquisition
          documents.
        </p>
      </section>
    );
  }
  return (
    <section className="grid gap-4">
      <Input
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder="Search data rooms"
        className="max-w-sm bg-background"
      />

      {filteredDataRooms?.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-background p-8 text-center">
          <h2 className="text-lg font-semibold">No data rooms found</h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Try a different search term.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDataRooms?.map((room) => (
            <CardDataRoom
              key={room.id}
              room={room}
              onMoveFolderToRoom={handleMoveFolderToRoom}
              onMoveFileToRoom={handleMoveFileToRoom}
              onUploadFilesToRoom={handleUploadFilesToRoom}
            />
          ))}
        </div>
      )}
    </section>
  );
}
