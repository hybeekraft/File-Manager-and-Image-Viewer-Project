import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
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
  ListChecks,
  LogOut,
  Search,
  Trash2,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  API_URL,
  clearToken,
  deleteFile,
  fetchFileBlobUrl,
  getCurrentUser,
  getFiles,
  getStats,
  getToken,
  login,
  register,
  setToken,
  triggerDownload,
  uploadFile,
} from "./api";
import type { FileItem, Stats, User } from "./types";

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

// Downloads and previews need the auth token attached, which plain
// <img src="..."> can't do. This fetches the file as a blob instead
// and renders it via a local object URL.
function AuthedImage({
  fileId,
  alt,
  className,
  style,
}: {
  fileId: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
}) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    fetchFileBlobUrl(fileId)
      .then((url) => {
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        objectUrl = url;
        setSrc(url);
      })
      .catch(() => {
        // leave src null; caller shows a fallback
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fileId]);

  if (!src) return <div className="image-loading" />;
  return <img src={src} alt={alt} className={className} style={style} />;
}

type SdlcPhase = {
  title: string;
  items: string[];
};

const SDLC_PHASES: SdlcPhase[] = [
  {
    title: "1. Requirements Analysis",
    items: [
      "Gather user requirements",
      "Document functional requirements",
      "Document non-functional requirements",
      "Identify system users and stakeholders",
    ],
  },
  {
    title: "2. System Design",
    items: [
      "Create the Use Case Diagram",
      "Design the Entity-Relationship (ER) Diagram",
      "Develop a wireframe for the file management interface",
    ],
  },
  {
    title: "3. Implementation",
    items: [
      "Set up the GitHub repository and project structure",
      "Develop the user authentication module",
      "Implement the file upload and download module",
      "Implement file organization and management features",
    ],
  },
  {
    title: "4. Testing",
    items: [
      "Create test cases for key system features",
      "Perform functional testing of file operations",
      "Identify, document, and fix software bugs",
    ],
  },
  {
    title: "5. Deployment",
    items: [
      "Prepare the deployment environment",
      "Deploy the File Management System to the production server",
      "Verify successful deployment and system functionality",
    ],
  },
  {
    title: "6. Maintenance",
    items: [
      "Monitor system performance and availability",
      "Apply security patches and software updates",
      "Implement user feedback and system improvements",
    ],
  },
];

const PLAN_STORAGE_KEY = "filemanager-project-plan-progress";

function ProjectPlan() {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(PLAN_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(checked));
    } catch {
      // ignore storage errors (e.g. private browsing)
    }
  }, [checked]);

  const toggle = (key: string) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const totalItems = SDLC_PHASES.reduce((sum, phase) => sum + phase.items.length, 0);
  const completedItems = Object.values(checked).filter(Boolean).length;

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1>Project Plan</h1>
        </div>
      </header>

      <section className="stats-row">
        <div className="stat-card">
          <span>Phases</span>
          <strong>{SDLC_PHASES.length}</strong>
        </div>
        <div className="stat-card">
          <span>Total tasks</span>
          <strong>{totalItems}</strong>
        </div>
        <div className="stat-card">
          <span>Completed</span>
          <strong>{completedItems} / {totalItems}</strong>
        </div>
      </section>

      <div className="plan-phases">
        {SDLC_PHASES.map((phase) => {
          const phaseDone = phase.items.filter((item) => checked[`${phase.title}::${item}`]).length;
          return (
            <section className="plan-phase-card" key={phase.title}>
              <div className="plan-phase-header">
                <h2>{phase.title}</h2>
                <span>{phaseDone} / {phase.items.length}</span>
              </div>
              <ul className="plan-item-list">
                {phase.items.map((item) => {
                  const key = `${phase.title}::${item}`;
                  return (
                    <li key={key}>
                      <label className="plan-item">
                        <input
                          type="checkbox"
                          checked={Boolean(checked[key])}
                          onChange={() => toggle(key)}
                        />
                        <span className={checked[key] ? "plan-item-text done" : "plan-item-text"}>
                          {item}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}

function AuthScreen({ onAuthed }: { onAuthed: (token: string, user: User) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result =
        mode === "login" ? await login(email, password) : await register(name, email, password);
      onAuthed(result.token, result.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="brand">
          <div className="brand-mark"><FolderOpen size={20} /></div>
          <span>File Manager</span>
        </div>
        <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="auth-subtitle">
          {mode === "login"
            ? "Log in to access your files."
            : "Sign up to start storing and organizing your files."}
        </p>
        <form onSubmit={submit}>
          {mode === "register" && (
            <label className="auth-field">
              <span>Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" />
            </label>
          )}
          <label className="auth-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </label>
          <label className="auth-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="At least 8 characters"
            />
          </label>
          {error && <div className="auth-error">{error}</div>}
          <button className="upload-button auth-submit" type="submit" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>
        <button
          className="auth-switch"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
        >
          {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Log in"}
        </button>
      </div>
    </div>
  );
}

function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const [files, setFiles] = useState<FileItem[]>([]);
  const [stats, setStats] = useState<Stats>({ totalFiles: 0, imageFiles: 0, totalBytes: 0 });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState<"files" | "plan">("files");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<FileItem | null>(null);
  const [zoom, setZoom] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // On first load, check for a saved token and validate it against the API.
  useEffect(() => {
    const existingToken = getToken();
    if (!existingToken) {
      setAuthChecked(true);
      return;
    }
    getCurrentUser()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setAuthChecked(true));
  }, []);

  const load = async () => {
    if (!user) return;
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
    if (!user) return;
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filter, user]);

  const storageLabel = useMemo(() => formatBytes(stats.totalBytes), [stats.totalBytes]);

  const handleAuthed = (token: string, authedUser: User) => {
    setToken(token);
    setUser(authedUser);
  };

  const handleLogout = () => {
    clearToken();
    setUser(null);
    setFiles([]);
    setStats({ totalFiles: 0, imageFiles: 0, totalBytes: 0 });
    setPage("files");
  };

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

  const isImage = (file: FileItem) => file.mimeType.startsWith("image/");

  if (!authChecked) {
    return <div className="auth-shell" />;
  }

  if (!user) {
    return <AuthScreen onAuthed={handleAuthed} />;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><FolderOpen size={20} /></div>
          <span>File Manager</span>
        </div>

        <nav>
          <button
            className={page === "files" && filter === "all" ? "nav-item active" : "nav-item"}
            onClick={() => { setPage("files"); setFilter("all"); }}
          >
            <LayoutGrid size={18} /> My files
          </button>
          <button
            className={page === "files" && filter === "image" ? "nav-item active" : "nav-item"}
            onClick={() => { setPage("files"); setFilter("image"); }}
          >
            <ImageIcon size={18} /> Images
          </button>
          <button
            className={page === "plan" ? "nav-item active" : "nav-item"}
            onClick={() => setPage("plan")}
          >
            <ListChecks size={18} /> Project Plan
          </button>
        </nav>

        <div className="sidebar-card">
          <div className="storage-icon"><HardDrive size={17} /></div>
          <div>
            <strong>{storageLabel}</strong>
            <span>used by you</span>
          </div>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={15} /> Log out
          </button>
        </div>
      </aside>

      <main className="main">
        {page === "plan" ? (
          <ProjectPlan />
        ) : (
          <>
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
                        <AuthedImage fileId={file.id} alt={file.originalName} />
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
                      <button className="download-link" onClick={() => triggerDownload(file.id, file.originalName)}>
                        Download <Download size={14}/>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
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
              <AuthedImage
                fileId={selected.id}
                alt={selected.originalName}
                style={{ transform: `scale(${zoom})`, maxWidth: "90%", maxHeight: "90%", objectFit: "contain", transition: "transform .15s" }}
              />
            </div>
            <div className="viewer-controls">
              <button onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}><ZoomOut size={17}/></button>
              <span>{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(Math.min(3, zoom + 0.25))}><ZoomIn size={17}/></button>
              <button className="viewer-download" onClick={() => triggerDownload(selected.id, selected.originalName)}>
                <Download size={16}/> Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
