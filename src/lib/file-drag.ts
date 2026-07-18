export const FILE_DRAG_TYPE = "application/x-dataroom-file";

export function setDraggedFileId(dataTransfer: DataTransfer, fileId: string) {
  dataTransfer.effectAllowed = "move";
  dataTransfer.setData(FILE_DRAG_TYPE, fileId);
}

export function getDraggedFileId(dataTransfer: DataTransfer) {
  return dataTransfer.getData(FILE_DRAG_TYPE) || null;
}

export function hasDraggedDataRoomFile(dataTransfer: DataTransfer) {
  return Array.from(dataTransfer.types).includes(FILE_DRAG_TYPE);
}

export function hasNativeFiles(dataTransfer: DataTransfer) {
  return Array.from(dataTransfer.types).includes("Files");
}
