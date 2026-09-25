# Annual Workload Management System (AWL)

This workspace contains the initial implementation of a college workload management platform.

## Structure

- `client/` — React + Vite + Tailwind dashboard interface
- `server/` — Express + Prisma API skeleton

## Frontend

```bash
cd client
npm install
npm run dev
```

## Backend

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

## Notes

- The dashboard is a production-oriented MVP interface for the Admin view.
- The backend exposes health, dashboard, and workload APIs for major AWL modules.
- Prisma schema is included to support PostgreSQL normalization and future migration work.

## Next modules

1. Role-based authentication and Clerk sync
2. Faculty dashboard and workload entry forms
3. HOD approval workflows
4. Reports and export features
5. Prisma migration seeding and PostgreSQL deployment
