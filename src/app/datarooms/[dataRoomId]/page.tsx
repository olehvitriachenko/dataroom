"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";

import { db } from "@/db/database";
import { buttonVariants } from "@/components/ui/button";
import { DataRoomExplorer } from "@/components/dataroom/data-room-explorer";
import { cn } from "@/lib/utils";

export default function DataRoomPage() {
  const { dataRoomId } = useParams<{
    dataRoomId: string;
  }>();

  const dataRoom = useLiveQuery(
    () => db.dataRooms.get(dataRoomId),
    [dataRoomId],
    null,
  );

  if (dataRoom === null) {
    return (
      <main className="min-h-screen bg-muted/20">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="h-8 w-64 animate-pulse rounded bg-muted" />
          <div className="mt-8 h-72 animate-pulse rounded-xl border bg-muted" />
        </div>
      </main>
    );
  }

  if (dataRoom === undefined) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/20 px-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Data room not found</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            This data room may have been deleted.
          </p>

          <Link
            href="/"
            className={cn(buttonVariants({ variant: "default" }), "mt-6")}
          >
            <ArrowLeft />
            Back to data rooms
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/20">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "ghost" }), "mb-6")}
        >
          <ArrowLeft />
          Data rooms
        </Link>

        <header className="mb-8">
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            Data room
          </p>

          <h1 className="text-3xl font-semibold tracking-tight">
            {dataRoom.name}
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Organize folders and due diligence documents.
          </p>
        </header>

        <DataRoomExplorer dataRoomId={dataRoomId} />
      </div>
    </main>
  );
}
