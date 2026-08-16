import type { FileItem, Stats } from "./types";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function parse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || "Request failed");
  }
  return response.status === 204 ? (undefined as T) : response.json();
}

export async function getFiles(search = "", type = "all") {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (type !== "all") params.set("type", type);
  return parse<FileItem[]>(await fetch(`${API_URL}/files?${params}`));
}

export async function getStats() {
  return parse<Stats>(await fetch(`${API_URL}/stats`));
}

export async function uploadFile(file: File) {
  const form = new FormData();
  form.append("file", file);
  return parse<FileItem>(
    await fetch(`${API_URL}/files/upload`, { method: "POST", body: form })
  );
}

export async function deleteFile(id: string) {
  return parse<void>(
    await fetch(`${API_URL}/files/${id}`, { method: "DELETE" })
  );
}
