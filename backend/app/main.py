from __future__ import annotations

import os
from pathlib import Path
from urllib.parse import urlsplit

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

from .job_manager import JobManager
from .models import JobRequest
from .services.translation import SUPPORTED_PROVIDERS

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CORS_ORIGINS = ["https://cs571-s26.github.io"]


def _env_list(name: str, default: list[str]) -> list[str]:
    value = os.getenv(name, "").strip()
    if not value:
        return default
    return [_normalize_origin(item) for item in value.split(",") if item.strip()]


def _normalize_origin(value: str) -> str:
    origin = value.strip().rstrip("/")
    if origin == "*":
        return origin
    parsed = urlsplit(origin)
    if parsed.scheme and parsed.netloc:
        return f"{parsed.scheme}://{parsed.netloc}"
    return origin


STORAGE_ROOT = Path(os.getenv("STORAGE_ROOT", str(ROOT / "storage"))).expanduser()
CORS_ALLOW_ORIGINS = sorted(
    set(_env_list("CORS_ALLOW_ORIGINS", DEFAULT_CORS_ORIGINS) + DEFAULT_CORS_ORIGINS)
)

job_manager = JobManager(storage_root=STORAGE_ROOT)

app = FastAPI(title="AI Translation Backend", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ALLOW_ORIGINS,
    allow_credentials="*" not in CORS_ALLOW_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _parse_bool(value: str) -> bool:
    return value.strip().lower() in {"1", "true", "yes", "on"}


class JobUpdate(BaseModel):
    fileName: str | None = None
    sourceLanguage: str | None = None
    targetLanguage: str | None = None


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


@app.patch("/api/jobs/{job_id}")
def update_job(job_id: str, update: JobUpdate) -> dict:
    file_name = update.fileName.strip() if update.fileName is not None else None
    source_language = (
        update.sourceLanguage.strip() if update.sourceLanguage is not None else None
    )
    target_language = (
        update.targetLanguage.strip() if update.targetLanguage is not None else None
    )

    if file_name is not None and not file_name:
        raise HTTPException(status_code=400, detail="File name cannot be empty.")
    if source_language is not None and not source_language:
        raise HTTPException(status_code=400, detail="Source language cannot be empty.")
    if target_language is not None and not target_language:
        raise HTTPException(status_code=400, detail="Target language cannot be empty.")

    try:
        job = job_manager.update_job_metadata(
            job_id,
            file_name=file_name,
            source_language=source_language,
            target_language=target_language,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    return {"job": job.to_dict()}


@app.delete("/api/jobs/{job_id}")
def delete_job(job_id: str) -> dict:
    try:
        deleted = job_manager.delete_job(job_id)
    except RuntimeError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    if not deleted:
        raise HTTPException(status_code=404, detail="Job not found.")
    return {"ok": True}


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


@app.delete("/api/jobs/{job_id}/artifacts/{artifact}")
def delete_artifact(job_id: str, artifact: str) -> dict:
    try:
        job = job_manager.delete_artifact(job_id, artifact)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    return {"job": job.to_dict()}
