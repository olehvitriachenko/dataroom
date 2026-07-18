export interface DataRoom {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Folder {
  id: string;
  dataRoomId: string;
  parentId: string | null;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DataRoomFile {
  id: string;
  dataRoomId: string;
  folderId: string | null;
  name: string;
  originalName: string;
  mimeType: "application/pdf";
  size: number;
  blob: Blob;
  createdAt: Date;
  updatedAt: Date;
}
