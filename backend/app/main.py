from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from .job_manager import JobManager
from .models import JobRequest
from .services.translation import SUPPORTED_PROVIDERS

ROOT = Path(__file__).resolve().parents[1]
STORAGE_ROOT = ROOT / "storage"

job_manager = JobManager(storage_root=STORAGE_ROOT)

app = FastAPI(title="AI Translation Backend", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _parse_bool(value: str) -> bool:
    return value.strip().lower() in {"1", "true", "yes", "on"}


@app.get("/api/health")
def health() -> dict:
    return {"ok": True}


@app.get("/api/meta")
def meta() -> dict:
    return {
        "providers": sorted(SUPPORTED_PROVIDERS),
        "maxFileSizeMb": 10,
        "supportedFormats": ["pdf", "txt"],
    }


@app.get("/api/jobs")
def list_jobs() -> dict:
    return {"jobs": [job.to_dict() for job in job_manager.list_jobs()]}


@app.get("/api/jobs/{job_id}")
def get_job(job_id: str) -> dict:
    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    return {"job": job.to_dict()}


@app.post("/api/jobs")
async def create_job(
    file: UploadFile = File(...),
    provider: str = Form(...),
    sourceLanguage: str = Form(...),
    targetLanguage: str = Form(...),
    apiKey: str = Form(...),
    includeBilingual: str = Form("true"),
    includeMonolingual: str = Form("true"),
    includeGlossary: str = Form("false"),
    model: str = Form(""),
) -> dict:
    provider = provider.strip()
    if provider not in SUPPORTED_PROVIDERS:
        raise HTTPException(status_code=400, detail="Unsupported provider.")

    file_name = (file.filename or "").strip()
    if not file_name.lower().endswith((".pdf", ".txt")):
        raise HTTPException(status_code=400, detail="Only PDF and TXT files are supported.")

    file_bytes = await file.read()
    if len(file_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File exceeds 10 MB limit.")
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    request = JobRequest(
        provider=provider,
        source_language=sourceLanguage.strip(),
        target_language=targetLanguage.strip(),
        api_key=apiKey.strip(),
        include_bilingual=_parse_bool(includeBilingual),
        include_monolingual=_parse_bool(includeMonolingual),
        include_glossary=_parse_bool(includeGlossary),
        model=model.strip() or None,
    )

    if not (request.include_bilingual or request.include_monolingual or request.include_glossary):
        raise HTTPException(status_code=400, detail="At least one output option must be enabled.")
    if not request.api_key:
        raise HTTPException(status_code=400, detail="API key is required.")

    job = job_manager.create_job(file_name=file_name, file_bytes=file_bytes, request=request)
    return {"job": job.to_dict()}


@app.get("/api/jobs/{job_id}/download/{artifact}")
def download_artifact(job_id: str, artifact: str):
    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    if job.status.value != "Completed":
        raise HTTPException(status_code=409, detail="Job is not completed yet.")

    artifact_map = {
        "mono": job.outputs.mono_pdf,
        "dual": job.outputs.dual_pdf,
        "source": job.outputs.source_txt,
        "translated": job.outputs.translated_txt,
        "glossary": job.outputs.glossary_csv,
    }
    path = artifact_map.get(artifact)
    if not path or not path.exists():
        raise HTTPException(status_code=404, detail="Requested output is unavailable.")

    media_type = "application/octet-stream"
    if path.suffix == ".pdf":
        media_type = "application/pdf"
    elif path.suffix == ".txt":
        media_type = "text/plain; charset=utf-8"
    elif path.suffix == ".csv":
        media_type = "text/csv; charset=utf-8"

    return FileResponse(path, media_type=media_type, filename=path.name)
