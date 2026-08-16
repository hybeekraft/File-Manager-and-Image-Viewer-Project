export type FileItem = {
  id: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  path: string;
  createdAt: string;
};

export type Stats = {
  totalFiles: number;
  imageFiles: number;
  totalBytes: number;
};
