"use client";

import Link from "next/link";
import { Folder } from "lucide-react";

import type { Folder as FolderEntity } from "@/types/entities";

interface FolderCardProps {
  folder: FolderEntity;
  dataRoomId: string;
}

export default function FolderCard({ folder, dataRoomId }: FolderCardProps) {
  return (
    <Link
      href={`/datarooms/${dataRoomId}?folderId=${folder.id}`}
      className="group flex items-center gap-4 rounded-xl border bg-card p4 shadow-sm transition hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md"
    >
      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Folder className="size-5 fill-current text-muted-foreground" />
      </div>

      <div className="min-w-0">
        <h3 className="truncate font-medium">{folder.name}</h3>

        <p className="mt-1 text-sm text-muted-foreground">Folder</p>
      </div>
    </Link>
  );
}
