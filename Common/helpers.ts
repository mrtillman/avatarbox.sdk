export function getFileExtension(fileName: string): any {
  return fileName.indexOf(".") > -1 ? fileName.split(".").pop() : null;
}