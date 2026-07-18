export const FOLDER_DRAG_TYPE = "application/x-dataroom-folder";

export function setDraggedFolderId(
  dataTransfer: DataTransfer,
  folderId: string,
) {
  dataTransfer.effectAllowed = "move";
  dataTransfer.setData(FOLDER_DRAG_TYPE, folderId);
  dataTransfer.setData("text/plain", folderId);
}

export function getDraggedFolderId(dataTransfer: DataTransfer) {
  return (
    dataTransfer.getData(FOLDER_DRAG_TYPE) ||
    dataTransfer.getData("text/plain") ||
    null
  );
}

export function hasDraggedFolder(dataTransfer: DataTransfer) {
  return Array.from(dataTransfer.types).includes(FOLDER_DRAG_TYPE);
}
