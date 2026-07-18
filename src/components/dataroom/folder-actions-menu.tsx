"use client";

import { Pencil, Trash2 } from "lucide-react";

import {
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface FolderActionsMenuProps {
  onRename: () => void;
  onDelete: () => void;
}

export function FolderContextMenuContent({
  onRename,
  onDelete,
}: FolderActionsMenuProps) {
  return (
    <>
      <ContextMenuItem
        onClick={(event) => {
          event.stopPropagation();
          onRename();
        }}
      >
        <Pencil />
        Rename
      </ContextMenuItem>

      <ContextMenuSeparator />

      <ContextMenuItem
        variant="destructive"
        onClick={(event) => {
          event.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 />
        Delete
      </ContextMenuItem>
    </>
  );
}

export function FolderDropdownMenuContent({
  onRename,
  onDelete,
}: FolderActionsMenuProps) {
  return (
    <>
      <DropdownMenuItem
        onClick={(event) => {
          event.stopPropagation();
          onRename();
        }}
      >
        <Pencil />
        Rename
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem
        variant="destructive"
        onClick={(event) => {
          event.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 />
        Delete
      </DropdownMenuItem>
    </>
  );
}
