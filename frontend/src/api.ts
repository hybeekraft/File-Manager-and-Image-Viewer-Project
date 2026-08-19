import type { FileItem, Stats, User } from "./types";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TOKEN_KEY = "filemanager-token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function parse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || "Request failed");
  }
  return response.status === 204 ? (undefined as T) : response.json();
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function register(name: string, email: string, password: string) {
  return parse<{ token: string; user: User }>(
    await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })
  );
}

export async function login(email: string, password: string) {
  return parse<{ token: string; user: User }>(
    await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
  );
}

export async function getCurrentUser() {
  return parse<User>(
    await fetch(`${API_URL}/auth/me`, { headers: authHeaders() })
  );
}

export async function getFiles(search = "", type = "all") {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (type !== "all") params.set("type", type);
  return parse<FileItem[]>(
    await fetch(`${API_URL}/files?${params}`, { headers: authHeaders() })
  );
}

export async function getStats() {
  return parse<Stats>(
    await fetch(`${API_URL}/stats`, { headers: authHeaders() })
  );
}

export async function uploadFile(file: File) {
  const form = new FormData();
  form.append("file", file);
  return parse<FileItem>(
    await fetch(`${API_URL}/files/upload`, {
      method: "POST",
      headers: authHeaders(),
      body: form,
    })
  );
}

export async function deleteFile(id: string) {
  return parse<void>(
    await fetch(`${API_URL}/files/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    })
  );
}

// Downloads require the auth token, which plain <img>/<a> tags can't send.
// Fetch the file as a blob instead and hand back a local object URL.
export async function fetchFileBlobUrl(id: string) {
  const response = await fetch(`${API_URL}/files/${id}/download`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Unable to load file.");
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export async function triggerDownload(id: string, filename: string) {
  const url = await fetchFileBlobUrl(id);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
