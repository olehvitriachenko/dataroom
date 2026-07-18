export const FOLDER_DRAG_TYPE = "application/x-dataroom-folder";

export function setDraggedFolderId(
  dataTransfer: DataTransfer,
  folderId: string,
) {
  dataTransfer.effectAllowed = "move";
  dataTransfer.setData(FOLDER_DRAG_TYPE, folderId);
}

export function getDraggedFolderId(dataTransfer: DataTransfer) {
  return dataTransfer.getData(FOLDER_DRAG_TYPE) || null;
}

export function hasDraggedFolder(dataTransfer: DataTransfer) {
  return Array.from(dataTransfer.types).includes(FOLDER_DRAG_TYPE);
}
