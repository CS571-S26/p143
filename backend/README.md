# Backend Service

FastAPI backend for the AI Translation Platform.

## Features

- Upload `PDF` / `TXT` files
- OCR fallback for scanned PDF pages (RapidOCR)
- Translation through `OpenAI`, `DeepSeek`, or `Gemini`
- Asynchronous background job processing
- Download endpoints for generated:
  - bilingual PDF
  - monolingual PDF
  - source text
  - translated text
  - glossary CSV (optional)

## Run Locally

```powershell
cd backend
python -m pip install -r requirements.txt
python run.py
```

Backend URL: `http://localhost:8000`

Optional local environment variables:

```powershell
$env:STORAGE_ROOT="C:\temp\ai-translation-storage"
$env:CORS_ALLOW_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"
python run.py
```

## Deploy To Render

This backend is prepared for Render as a Docker web service through the root
`render.yaml` file.

Render service settings:

- Runtime: `docker`
- Root directory: `backend`
- Dockerfile: `./Dockerfile`
- Health check path: `/api/health`
- Persistent disk mount path: `/data`
- Storage path: `/data/storage`

Required Render environment variable:

```text
CORS_ALLOW_ORIGINS=https://cs571-s26.github.io
```

Use the exact GitHub Pages origin that hosts the frontend. If your frontend is
served from `https://<your-github-username>.github.io/p143/`, the origin is
still `https://<your-github-username>.github.io`.
Do not include the app path or hash route (`/p143/#/`) in `CORS_ALLOW_ORIGINS`.

After Render creates the backend, update the frontend GitHub Pages build with:

```text
VITE_API_BASE_URL=https://<your-render-service>.onrender.com
```

Then rebuild and redeploy the frontend.

Current backend deployment:

```text
https://ai-translation-backend-5e2b.onrender.com
```

Current frontend deployment:

```text
https://cs571-s26.github.io/p143/#/
```

## API Endpoints

- `GET /api/health`
- `GET /api/meta`
- `GET /api/jobs`
- `GET /api/jobs/{job_id}`
- `PATCH /api/jobs/{job_id}` (edit display file name/language metadata)
- `DELETE /api/jobs/{job_id}` (remove a completed/failed job and its files)
- `POST /api/jobs` (multipart form)
- `GET /api/jobs/{job_id}/download/{artifact}`
- `DELETE /api/jobs/{job_id}/artifacts/{artifact}` (remove one generated output)

`artifact` can be: `mono`, `dual`, `source`, `translated`, `glossary`.
