"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  ChevronRight,
  Folder,
} from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";

import { db } from "@/db/database";
import { buttonVariants } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CreateFolderDialog } from "@/components/dataroom/create-folder-dialog";
import { UploadPdfButton } from "@/components/dataroom/upload-pdf-button";
import { cn } from "@/lib/utils";
import type { Folder as FolderEntity } from "@/types/entities";

interface DataRoomHeaderProps {
  dataRoomId: string;
  dataRoomName: string;
}

function getFolderHref(dataRoomId: string, folderId: string | null) {
  return folderId
    ? `/datarooms/${dataRoomId}?folderId=${folderId}`
    : `/datarooms/${dataRoomId}`;
}

function buildFolderPath(
  folders: FolderEntity[],
  currentFolderId: string | null,
) {
  if (!currentFolderId) {
    return [];
  }

  const foldersById = new Map(folders.map((folder) => [folder.id, folder]));
  const visited = new Set<string>();
  const path: FolderEntity[] = [];
  let nextFolderId: string | null = currentFolderId;

  while (nextFolderId && !visited.has(nextFolderId)) {
    visited.add(nextFolderId);

    const folder = foldersById.get(nextFolderId);

    if (!folder) {
      break;
    }

    path.unshift(folder);
    nextFolderId = folder.parentId;
  }

  return path;
}

export function DataRoomHeader({
  dataRoomId,
  dataRoomName,
}: DataRoomHeaderProps) {
  const searchParams = useSearchParams();
  const currentFolderId = searchParams.get("folderId");

  const folders = useLiveQuery(
    () => db.folders.where("dataRoomId").equals(dataRoomId).toArray(),
    [dataRoomId],
  );

  const folderPath = buildFolderPath(folders ?? [], currentFolderId);
  const currentFolder = folderPath.at(-1) ?? null;
  const parentFolderId = currentFolder?.parentId ?? null;
  const canGoUp = Boolean(currentFolder);
  const backHref = canGoUp ? getFolderHref(dataRoomId, parentFolderId) : "/";
  const title = currentFolder?.name ?? dataRoomName;

  return (
    <header className="mb-7 border-b bg-background pb-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Breadcrumb className="min-w-0">
          <BreadcrumbList className="gap-1 text-xs font-medium">
            <BreadcrumbItem>
              <BreadcrumbLink
                render={<Link href="/" />}
                className="text-muted-foreground hover:text-foreground"
              >
                Data rooms
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator className="text-muted-foreground/60">
              <ChevronRight className="size-3" />
            </BreadcrumbSeparator>

            <BreadcrumbItem>
              {folderPath.length > 0 ? (
                <BreadcrumbLink
                  render={<Link href={getFolderHref(dataRoomId, null)} />}
                  className="max-w-48 truncate text-muted-foreground hover:text-foreground"
                >
                  {dataRoomName}
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="max-w-56 truncate font-medium">
                  {dataRoomName}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>

            {folderPath.map((folder, index) => {
              const isCurrent = index === folderPath.length - 1;

              return (
                <FragmentedBreadcrumbItem
                  key={folder.id}
                  href={getFolderHref(dataRoomId, folder.id)}
                  isCurrent={isCurrent}
                  label={folder.name}
                />
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>

      </div>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={backHref}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-lg" }),
              "shrink-0 text-muted-foreground hover:text-foreground",
            )}
            aria-label={canGoUp ? "Go back" : "Back to data rooms"}
          >
            <ArrowLeft />
          </Link>

          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/70">
            {currentFolder ? (
              <Folder className="size-4.5 fill-current text-muted-foreground" />
            ) : (
              <Building2 className="size-4.5 text-muted-foreground" />
            )}
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <UploadPdfButton dataRoomId={dataRoomId} folderId={currentFolderId} />

          <CreateFolderDialog
            dataRoomId={dataRoomId}
            parentId={currentFolderId}
          />
        </div>
      </div>
    </header>
  );
}

function FragmentedBreadcrumbItem({
  href,
  isCurrent,
  label,
}: {
  href: string;
  isCurrent: boolean;
  label: string;
}) {
  return (
    <>
      <BreadcrumbSeparator className="text-muted-foreground/60">
        <ChevronRight className="size-3" />
      </BreadcrumbSeparator>

      <BreadcrumbItem>
        {isCurrent ? (
          <BreadcrumbPage className="max-w-56 truncate font-medium">
            {label}
          </BreadcrumbPage>
        ) : (
          <BreadcrumbLink
            render={<Link href={href} />}
            className="max-w-48 truncate text-muted-foreground hover:text-foreground"
          >
            {label}
          </BreadcrumbLink>
        )}
      </BreadcrumbItem>
    </>
  );
}
