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

## API Endpoints

- `GET /api/health`
- `GET /api/meta`
- `GET /api/jobs`
- `GET /api/jobs/{job_id}`
- `POST /api/jobs` (multipart form)
- `GET /api/jobs/{job_id}/download/{artifact}`

`artifact` can be: `mono`, `dual`, `source`, `translated`, `glossary`.
