# CrimeVista deployment guide

## Architecture

CrimeVista is configured as a single-service deployment:

- One Render Web Service runs the FastAPI application.
- The same service serves the built React frontend from `frontend/dist`.
- One Render PostgreSQL service provides the production database.
- The API receives `DATABASE_URL` from Render and uses it in production.

## Render configuration

Create a Render Web Service with the following settings:

- Build Command:
  ```bash
  cd backend && python -m pip install -r requirements.txt && cd ../frontend && npm install && npm run build
  ```
- Start Command:
  ```bash
  cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
  ```
- Health Check Path: `/api/health`
- Auto-Deploy: enabled

Attach a PostgreSQL database to the service and copy the provided `DATABASE_URL` into the Render environment variables.

## Required environment variables

Set these variables in the Render service:

```bash
APP_ENV=production
DATABASE_URL=postgresql+psycopg://<user>:<password>@<host>:<port>/<database>
API_ADMIN_TOKEN=<random-long-secret>
FRONTEND_URL=https://<your-render-app>.onrender.com
CORS_ORIGINS=https://<your-render-app>.onrender.com
DATASET_PATH=/opt/render/project/src/backend/data/initial/nagpur_crime_data.csv
```

Notes:

- `API_ADMIN_TOKEN` is required in production for protected upload/admin requests.
- `FRONTEND_URL` and `CORS_ORIGINS` should point to the public Render URL.
- If you use same-origin hosting, a single service origin is often enough; `CORS_ORIGINS` remains optional for local dev.

## Startup behavior

The app performs the following startup actions:

1. Resolves the database URL from `DATABASE_URL` or PostgreSQL environment values.
2. Creates tables automatically via SQLAlchemy metadata.
3. Checks for existing crime records.
4. Imports the bundled dataset only when the database is empty.
5. Serves the frontend from `/` and keeps `/api/*` endpoints reachable.

## Health checks

The Render health check expects:

- `GET /api/health`
- HTTP 200 response
- A `status: "ok"` body

## Local fallback

Local development is still supported by leaving `APP_ENV` unset or set to `development`, which allows an SQLite fallback when no database URL is configured.

Do not rely on SQLite for production workloads.
postgresql://crimevista_user:PdhxCm2ZoZuSr8ZaSECnCMlqgDGyWc1Q@dpg-db0lslmgekts73a9at9g-a/crimevista