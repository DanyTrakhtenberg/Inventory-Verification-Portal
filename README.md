# Inventory Verification Portal

A full-stack web application that allows admins to upload inventory files (CSV or XLSX) per client, run validations, and browse upload history.

## Architecture

```
┌─────────────────┐     HTTP + Bearer Token      ┌─────────────────┐
│  React (Vite)   │ ◄──────────────────────────► │  Express.js     │
│  TypeScript     │     /api/* proxied to :3001  │  TypeScript     │
│  Port 5173      │                              │  Port 3001      │
└─────────────────┘                              └────────┬────────┘
                                                          │
                                                          ▼
                                                 ┌─────────────────┐
                                                 │  PostgreSQL     │
                                                 │  clients        │
                                                 │  uploads        │
                                                 │  validation_    │
                                                 │    results      │
                                                 └─────────────────┘
```

- **Frontend**: React with Vite, TypeScript, React Router. Uses Fetch API for all backend calls.
- **Backend**: Node.js, Express, TypeScript. Multer for file uploads (memory storage). No files are persisted.
- **Database**: PostgreSQL with `clients`, `uploads`, and `validation_results` tables.

## Auth Approach

- **Token-based**: A single shared API token (`API_TOKEN` env var) is used for all requests.
- **Header**: Every request must include `Authorization: Bearer <API_TOKEN>`.
- **Middleware**: `auth.middleware.ts` runs on all `/uploads` and `/clients` routes. Missing or invalid tokens return HTTP 401.
- **No OAuth** or user accounts; this is a simple API key style auth suitable for internal/admin tools.

## Validation Design

Four validation rules run on each upload:

| Rule | Purpose |
|------|---------|
| `required_columns` | Ensures `status`, `cost`, and `price` columns exist |
| `police_hold` | Fails if any row has `status === "POLICE_HOLD"` |
| `missing_items` | Fails if any row has `status === "MISSING"` |
| `cost_vs_price` | Fails if any row has `cost < price` |

Each rule returns `{ rule, passed, details }`. Results are stored in `validation_results` with `details` as JSONB. Overall pass/fail is true only if all rules pass.

## Why JSONB for Validation Details

- **Flexibility**: Each rule returns different structures (e.g., `required_columns` returns `missing`/`found`, `cost_vs_price` returns `items` with row numbers).
- **Queryable**: PostgreSQL can index and query JSONB if needed later.
- **No schema churn**: Adding new rules does not require migrations for new columns.

## Assumptions About Inventory Data

- Column names are **case-insensitive** and trimmed; `Status`, ` status `, and `status` are equivalent.
- Required columns: `status`, `cost`, `price`.
- Status values are normalized to uppercase for comparison (`POLICE_HOLD`, `MISSING`).
- Cost and price are numeric; non-numeric values are treated as null and skipped for cost vs price checks.
- CSV and XLSX only; first sheet used for XLSX.
- File size limit: 10MB.

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL

### Database

**Option A: Docker (recommended)**

```bash
docker compose up -d db
```

This starts PostgreSQL on port 5433 (avoids conflict with local PostgreSQL on 5432). Use:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/inventory_verification
```

**Option B: Local PostgreSQL**

```bash
createdb inventory_verification
psql -d inventory_verification -f backend/src/db/schema.sql
```

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set DATABASE_URL and API_TOKEN
npm install
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env
# Edit .env if needed: VITE_API_URL (default /api), VITE_API_TOKEN
npm install
npm run dev
```

### Dev Token

For local development, set `API_TOKEN=dev-token` in backend `.env` and `VITE_API_TOKEN=dev-token` in frontend `.env`.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /uploads | Upload file (multipart: `file`, `clientName`) |
| GET | /uploads | List uploads, optional `?clientId=` |
| GET | /uploads/:id | Get upload metadata + validation results |
| GET | /clients | List all clients |

All require `Authorization: Bearer <API_TOKEN>`.
