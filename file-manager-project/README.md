# File Manager & Image Viewer

A full-stack school project designed to give hands-on practice with GitHub, GitLab, Jira, Trello, Asana, Azure DevOps, Git workflows, REST APIs, testing, and CI/CD.

## Features

- Upload files
- Browse files in a responsive dashboard
- Search and filter files
- Image thumbnails
- Full-screen image viewer with zoom
- Download files
- Delete files
- File metadata and storage statistics
- REST API
- PostgreSQL persistence
- Automated backend tests
- GitHub Actions CI
- Azure DevOps pipeline
- Docker Compose for PostgreSQL

## Stack

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL + Prisma
- Styling: CSS with a responsive dashboard design
- Testing: Vitest + Supertest
- CI: GitHub Actions + Azure DevOps
- Containerization: Docker Compose

## Requirements

- Node.js 20+
- npm 10+
- Docker Desktop (recommended for PostgreSQL)

## Run locally

### 1. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Start PostgreSQL

From the project root:

```bash
docker compose up -d postgres
```

### 3. Configure backend

```bash
cd backend
cp .env.example .env
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Backend runs on `http://localhost:5000`.

### 4. Start frontend

In another terminal:

```bash
cd frontend
npm run dev
```

Frontend runs on the URL printed by Vite, normally `http://localhost:5173`.

## Project structure

```text
file-manager-project/
├── backend/
│   ├── prisma/
│   ├── src/
│   ├── tests/
│   └── package.json
├── frontend/
│   ├── src/
│   └── package.json
├── .github/workflows/ci.yml
├── azure-pipelines.yml
├── docker-compose.yml
└── docs/
```

## Git workflow

Use:

```text
main
└── develop
    ├── feature/upload-files
    ├── feature/image-viewer
    └── fix/delete-file
```

Recommended commits:

```text
feat: add file upload endpoint
feat: add image viewer
fix: validate unsupported file types
test: add file route tests
docs: update setup guide
```

## Project-management workflow

Use one tool as the primary tracker and mirror the learning exercise into the others:

- Jira: epics, stories, bugs, sprint planning
- Trello: Kanban workflow
- Asana: project/task management
- GitHub: repository, issues, pull requests, code review
- GitLab: repository mirror and CI comparison
- Azure DevOps: pipeline and deployment practice

See `docs/PROJECT_MANAGEMENT.md` and `docs/DEVOPS.md`.

## API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/files` | List files |
| GET | `/api/files/:id` | Get one file |
| POST | `/api/files/upload` | Upload a file |
| GET | `/api/files/:id/download` | Download file |
| DELETE | `/api/files/:id` | Delete file |
| GET | `/api/stats` | Storage statistics |

## Notes

Uploaded files are stored in `backend/uploads`. This is intentionally simple for a learning project. For production, replace local storage with Azure Blob Storage or another object-storage provider.
