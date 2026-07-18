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

interface FileActionsMenuProps {
  onRename: () => void;
  onDelete: () => void;
}

export function FileContextMenuContent({
  onRename,
  onDelete,
}: FileActionsMenuProps) {
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

export function FileDropdownMenuContent({
  onRename,
  onDelete,
}: FileActionsMenuProps) {
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
