import { useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  Download,
  File,
  FileImage,
  FileText,
  FolderOpen,
  HardDrive,
  Image as ImageIcon,
  LayoutGrid,
  List,
  MoreHorizontal,
  Search,
  Trash2,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { API_URL, deleteFile, getFiles, getStats, uploadFile } from "./api";
import type { FileItem, Stats } from "./types";

const formatBytes = (bytes: number) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), 3);
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
};

const iconFor = (mime: string) => {
  if (mime.startsWith("image/")) return <FileImage />;
  if (mime.includes("pdf")) return <FileText />;
  if (mime.includes("zip")) return <Archive />;
  return <File />;
};

function App() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [stats, setStats] = useState<Stats>({ totalFiles: 0, imageFiles: 0, totalBytes: 0 });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<FileItem | null>(null);
  const [zoom, setZoom] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      const [items, currentStats] = await Promise.all([
        getFiles(search, filter),
        getStats(),
      ]);
      setFiles(items);
      setStats(currentStats);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load files");
    }
  };

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [search, filter]);

  const storageLabel = useMemo(() => formatBytes(stats.totalBytes), [stats.totalBytes]);

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setUploading(true);
    setMessage("");
    try {
      for (const file of Array.from(fileList)) {
        await uploadFile(file);
      }
      await load();
      setMessage(`${fileList.length} file${fileList.length > 1 ? "s" : ""} uploaded.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (file: FileItem) => {
    if (!window.confirm(`Delete "${file.originalName}"?`)) return;
    try {
      await deleteFile(file.id);
      if (selected?.id === file.id) setSelected(null);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Delete failed");
    }
  };

  const downloadUrl = (file: FileItem) => `${API_URL}/files/${file.id}/download`;
  const isImage = (file: FileItem) => file.mimeType.startsWith("image/");

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><FolderOpen size={20} /></div>
          <span>FileNest</span>
        </div>

        <nav>
          <button className="nav-item active"><LayoutGrid size={18} /> My files</button>
          <button className="nav-item" onClick={() => setFilter("image")}><ImageIcon size={18} /> Images</button>
        </nav>

        <div className="sidebar-card">
          <div className="storage-icon"><HardDrive size={17} /></div>
          <div>
            <strong>{storageLabel}</strong>
            <span>used locally</span>
          </div>
        </div>

        <div className="sidebar-bottom">
          <span>FileNest v1.0</span>
          <span>Learning project</span>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">Workspace</p>
            <h1>My files</h1>
          </div>
          <button className="upload-button" onClick={() => inputRef.current?.click()}>
            <Upload size={17} />
            {uploading ? "Uploading..." : "Upload files"}
          </button>
          <input
            ref={inputRef}
            hidden
            type="file"
            multiple
            onChange={(e) => handleUpload(e.target.files)}
          />
        </header>

        <section className="stats-row">
          <div className="stat-card">
            <span>Total files</span>
            <strong>{stats.totalFiles}</strong>
          </div>
          <div className="stat-card">
            <span>Images</span>
            <strong>{stats.imageFiles}</strong>
          </div>
          <div className="stat-card">
            <span>Storage used</span>
            <strong>{storageLabel}</strong>
          </div>
        </section>

        <section className="toolbar">
          <div className="search-box">
            <Search size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files..."
            />
          </div>

          <div className="toolbar-actions">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All files</option>
              <option value="image">Images</option>
            </select>
            <div className="view-toggle">
              <button className={view === "grid" ? "selected" : ""} onClick={() => setView("grid")}><LayoutGrid size={17} /></button>
              <button className={view === "list" ? "selected" : ""} onClick={() => setView("list")}><List size={17} /></button>
            </div>
          </div>
        </section>

        {message && <div className="notice">{message}<button onClick={() => setMessage("")}><X size={15}/></button></div>}

        {files.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Upload size={25} /></div>
            <h2>No files found</h2>
            <p>Upload your first file to start building your library.</p>
            <button className="secondary-button" onClick={() => inputRef.current?.click()}>Choose files</button>
          </div>
        ) : (
          <div className={view === "grid" ? "file-grid" : "file-list"}>
            {files.map((file) => (
              <article className="file-card" key={file.id}>
                <button className="file-preview" onClick={() => isImage(file) && (setSelected(file), setZoom(1))}>
                  {isImage(file) ? (
                    <img src={`${API_URL}/files/${file.id}/download`} alt={file.originalName} />
                  ) : (
                    <div className="file-type-icon">{iconFor(file.mimeType)}</div>
                  )}
                </button>
                <div className="file-info">
                  <div className="file-title-row">
                    <div>
                      <strong title={file.originalName}>{file.originalName}</strong>
                      <span>{formatBytes(file.size)} · {new Date(file.createdAt).toLocaleDateString()}</span>
                    </div>
                    <button className="icon-button" aria-label="Delete file" onClick={() => handleDelete(file)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <a className="download-link" href={downloadUrl(file)}>Download <Download size={14}/></a>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="viewer" onClick={(e) => e.stopPropagation()}>
            <div className="viewer-header">
              <div>
                <strong>{selected.originalName}</strong>
                <span>{formatBytes(selected.size)}</span>
              </div>
              <button className="icon-button" onClick={() => setSelected(null)}><X /></button>
            </div>
            <div className="viewer-stage">
              <img
                src={`${API_URL}/files/${selected.id}/download`}
                alt={selected.originalName}
                style={{ transform: `scale(${zoom})` }}
              />
            </div>
            <div className="viewer-controls">
              <button onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}><ZoomOut size={17}/></button>
              <span>{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(Math.min(3, zoom + 0.25))}><ZoomIn size={17}/></button>
              <a className="viewer-download" href={downloadUrl(selected)}><Download size={16}/> Download</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
