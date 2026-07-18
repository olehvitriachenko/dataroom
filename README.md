# Data Room MVP

A Google Drive-inspired virtual data room for organizing due diligence PDFs.

## Tech Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- shadcn/ui on Base UI
- Dexie + IndexedDB
- react-pdf for in-app PDF preview
- lucide-react icons
- sonner toasts

## Setup

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

Useful checks:

```bash
pnpm lint
pnpm test
pnpm build
```

## Features

- Create, rename, and delete data rooms.
- Create nested folders.
- Browse folders with breadcrumbs and back navigation.
- Rename and delete folders.
- Deleting a folder removes nested folders and files.
- Upload PDF files only.
- View PDFs in a responsive in-app preview.
- Rename and delete PDFs.
- Drag folders between folders and data rooms.
- Drag PDFs between folders and data rooms.
- Drag external PDFs into the current folder or onto a target folder/data room.
- Search data rooms, folders, and PDFs by name.

## Design Decisions

Data is stored locally in IndexedDB via Dexie. This keeps the MVP fully end-to-end without a backend while preserving realistic data modeling for data rooms, folders, and files.

The schema separates `dataRooms`, `folders`, and `files`. Folders use `parentId` for nesting. Files use `folderId` for placement and store the PDF `Blob` locally.

The UI uses cards, breadcrumbs, context menus, and dropdown menus to keep the workflows close to familiar file managers. Desktop users can right-click cards; mobile users always have a visible three-dots menu.

PDF preview uses `react-pdf` in a client-only dynamic component because `pdf.js` depends on browser APIs. The preview measures its container with `ResizeObserver` and passes a responsive width to each page.

## Edge Cases

- Empty folder and empty data room states are handled.
- Non-PDF uploads are rejected with a toast.
- Duplicate folder names are blocked within the same parent.
- Duplicate PDF uploads are automatically renamed with numeric suffixes.
- Duplicate PDF names are blocked on rename within the same folder.
- Moving a folder into itself or its descendant is blocked.
- No-op drag/drop moves do not show success messages.
- File and folder drag payloads use separate custom MIME types to avoid cross-handling bugs.

## Notes

This is a frontend-only MVP. A production version would move file storage to blob storage and add authentication plus server-side authorization checks. Auth is intentionally out of scope here because all data is local to the browser.
