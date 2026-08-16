# Quick Start

1. Install Node.js 20+ and Docker Desktop.
2. Run `docker compose up -d postgres`.
3. In `backend`, copy `.env.example` to `.env`.
4. Run `npm install`.
5. Run `npx prisma generate`.
6. Run `npx prisma migrate dev --name init`.
7. Run `npm run dev`.
8. In another terminal, enter `frontend`.
9. Run `npm install`.
10. Run `npm run dev`.
11. Open the Vite URL shown in the terminal.
