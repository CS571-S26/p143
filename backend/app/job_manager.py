from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import threading
import uuid

from .models import JobRecord, JobRequest, JobStatus
from .services.extraction import extract_document_text
from .services.pdf_output import build_bilingual_pdf, build_glossary_csv, build_monolingual_pdf
from .services.translation import TranslationService, split_text_into_chunks


class JobManager:
    def __init__(self, storage_root: Path):
        self.storage_root = storage_root
        self.storage_root.mkdir(parents=True, exist_ok=True)
        self._jobs: dict[str, JobRecord] = {}
        self._lock = threading.RLock()
        self._executor = ThreadPoolExecutor(max_workers=2, thread_name_prefix="translation-job")

    def list_jobs(self) -> list[JobRecord]:
        with self._lock:
            return sorted(self._jobs.values(), key=lambda job: job.updated_at, reverse=True)

    def get_job(self, job_id: str) -> JobRecord | None:
        with self._lock:
            return self._jobs.get(job_id)

    def create_job(self, file_name: str, file_bytes: bytes, request: JobRequest) -> JobRecord:
        job_id = uuid.uuid4().hex[:12]
        job_dir = self.storage_root / job_id
        job_dir.mkdir(parents=True, exist_ok=True)

        safe_name = Path(file_name).name
        input_path = job_dir / safe_name
        input_path.write_bytes(file_bytes)

        record = JobRecord(
            id=job_id,
            file_name=safe_name,
            input_path=input_path,
            request=request,
            message="Queued for processing.",
        )
        with self._lock:
            self._jobs[job_id] = record

        self._executor.submit(self._run_job, job_id, job_dir)
        return record

    def _update_job(
        self,
        job: JobRecord,
        *,
        status: JobStatus | None = None,
        progress: int | None = None,
        stage: str | None = None,
        message: str | None = None,
        error: str | None = None,
    ) -> None:
        with self._lock:
            if status is not None:
                job.status = status
            if progress is not None:
                job.progress = max(0, min(progress, 100))
            if stage is not None:
                job.stage = stage
            if message is not None:
                job.message = message
            if error is not None:
                job.error = error
            job.touch()

    def _run_job(self, job_id: str, job_dir: Path) -> None:
        job = self.get_job(job_id)
        if not job:
            return
        try:
            self._update_job(
                job,
                status=JobStatus.RUNNING,
                progress=5,
                stage="extracting",
                message="Extracting text from document.",
            )

            extraction = extract_document_text(
                job.input_path,
                progress_callback=lambda current, total: self._update_job(
                    job,
                    progress=5 + int((current / max(total, 1)) * 20),
                    stage="extracting",
                    message=f"Extracting page {current}/{total}",
                ),
            )

            source_text = extraction.full_text
            source_chunks = split_text_into_chunks(source_text)
            source_txt_path = job_dir / "source.txt"
            source_txt_path.write_text(source_text, encoding="utf-8")
            job.outputs.source_txt = source_txt_path

            self._update_job(
                job,
                progress=30,
                stage="translating",
                message="Sending chunks to translation provider.",
            )

            translator = TranslationService(
                provider=job.request.provider,
                api_key=job.request.api_key,
                model=job.request.model,
            )
            translated_chunks = translator.translate_chunks(
                source_chunks,
                source_language=job.request.source_language,
                target_language=job.request.target_language,
                progress_callback=lambda current, total: self._update_job(
                    job,
                    progress=30 + int((current / max(total, 1)) * 45),
                    stage="translating",
                    message=f"Translating chunk {current}/{total}",
                ),
            )
            translated_text = "\n\n".join(translated_chunks).strip()
            translated_txt_path = job_dir / "translated.txt"
            translated_txt_path.write_text(translated_text, encoding="utf-8")
            job.outputs.translated_txt = translated_txt_path

            self._update_job(
                job,
                progress=80,
                stage="rendering",
                message="Generating output files.",
            )

            if job.request.include_monolingual:
                mono_path = job_dir / f"{job.input_path.stem}-mono.pdf"
                build_monolingual_pdf(
                    translated_text,
                    mono_path,
                    title=f"{job.file_name} - Monolingual Translation",
                )
                job.outputs.mono_pdf = mono_path

            if job.request.include_bilingual:
                dual_path = job_dir / f"{job.input_path.stem}-dual.pdf"
                build_bilingual_pdf(
                    source_chunks,
                    translated_chunks,
                    dual_path,
                    title=f"{job.file_name} - Bilingual Translation",
                )
                job.outputs.dual_pdf = dual_path

            if job.request.include_glossary:
                glossary_path = job_dir / f"{job.input_path.stem}-glossary.csv"
                build_glossary_csv(source_text, translated_text, glossary_path)
                job.outputs.glossary_csv = glossary_path

            self._update_job(
                job,
                status=JobStatus.COMPLETED,
                progress=100,
                stage="completed",
                message="Translation complete. Files are ready to download.",
            )
        except Exception as exc:
            self._update_job(
                job,
                status=JobStatus.FAILED,
                progress=100,
                stage="failed",
                message="Translation job failed.",
                error=str(exc),
            )
