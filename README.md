# AI Translation Platform

An AI-powered web platform for translating dense texts, especially philosophical works, with high speed and strong terminology consistency.

## Overview

Recent advances in natural language processing have made top AI models highly capable in translation, including complex academic material. This project turns that capability into a practical tool for researchers, students, and general readers.

Users can upload source files (`PDF`/`TXT`, up to 10 MB), extract text with OCR when needed, provide their own API key, and generate high-quality translations quickly. The platform also builds a glossary table and exports readable output files for both study and casual reading.

## Core Features

- Upload source documents in `PDF` or `TXT` format (max file size: `10 MB`)
- OCR pipeline for scanned pages and image-based PDFs
- User-provided API key input for model flexibility and user control
- AI translation by text chunks for speed and stability
- Automatic glossary table generation
- Export bilingual PDF (original + translation side by side)
- Export monolingual PDF (clean translated text only)

## Target Users

- Researchers working with primary sources
- Students reading academic or philosophical texts
- Readers who want fast access to translated materials

## Translation Workflow

1. User uploads a `PDF` or `TXT` file.
2. System validates file type and size (`< 10 MB`).
3. OCR extracts text for scanned or image-based pages.
4. User enters their preferred model API key.
5. System creates a glossary table from key terms.
6. Text is translated in chunks into the target language.
7. Platform generates downloadable output files:
   - Bilingual PDF (source and translation side by side)
   - Monolingual PDF (translation only)

## Why This Project

- Traditional expert translation of a 200-300 page book can take months to years.
- Modern AI models can process similar volume in hours.
- This platform bridges that performance gap for everyday users through a simple web interface.

## Planned Scope

- Web interface for upload, key input, and download
- OCR + translation processing pipeline
- PDF generation module for bilingual and monolingual outputs
- Basic error handling for unsupported files and API failures

## Current Architecture

- Frontend: React + React Bootstrap + React Router (`src/`)
- Backend: FastAPI async job service (`backend/`)
- Processing flow:
  1. Upload PDF/TXT + translation settings
  2. Text extraction from PDF/TXT with OCR fallback for scanned pages
  3. Translation via OpenAI / DeepSeek / Gemini APIs
  4. Asynchronous job tracking (`Queued`, `Running`, `Completed`, `Failed`)
  5. Download generated `dual` PDF, `mono` PDF, source text, translated text, and glossary CSV (optional)

## Run Locally

Terminal 1 (backend):

```bash
cd backend
python -m pip install -r requirements.txt
python run.py
```

Terminal 2 (frontend):

```bash
npm install
npm run dev
```

If needed, set frontend API base URL:

```bash
VITE_API_BASE_URL=http://localhost:8000
```

## Backend Deployment

The backend is prepared for Render deployment with:

- `render.yaml` at the repo root
- `backend/Dockerfile`
- persistent storage via `STORAGE_ROOT=/data/storage`
- CORS control via `CORS_ALLOW_ORIGINS`
- Linux CJK fonts in the Docker image for Chinese PDF rendering

On Render, create the backend from the Blueprint or Docker web service config,
then set:

```text
CORS_ALLOW_ORIGINS=https://<your-github-username>.github.io
```

After Render provides the backend URL, update the frontend deployment variable:

```text
VITE_API_BASE_URL=https://<your-render-service>.onrender.com
```

## Notes

- Users are responsible for their own API usage costs.
- Translation quality depends on the selected model and source text quality (especially OCR input quality).
- Human proofreading is still recommended for publication-grade output.

## License

To be added.
