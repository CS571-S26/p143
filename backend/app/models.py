from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path
from typing import Optional


class JobStatus(str, Enum):
    QUEUED = "Queued"
    RUNNING = "Running"
    COMPLETED = "Completed"
    FAILED = "Failed"


@dataclass
class JobRequest:
    provider: str
    source_language: str
    target_language: str
    api_key: str
    include_bilingual: bool
    include_monolingual: bool
    include_glossary: bool
    model: Optional[str] = None


@dataclass
class JobOutputs:
    mono_pdf: Optional[Path] = None
    dual_pdf: Optional[Path] = None
    source_txt: Optional[Path] = None
    translated_txt: Optional[Path] = None
    glossary_csv: Optional[Path] = None


@dataclass
class JobRecord:
    id: str
    file_name: str
    input_path: Path
    request: JobRequest
    status: JobStatus = JobStatus.QUEUED
    progress: int = 0
    stage: str = "queued"
    message: str = "Job queued."
    error: Optional[str] = None
    outputs: JobOutputs = field(default_factory=JobOutputs)
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def touch(self) -> None:
        self.updated_at = datetime.now(timezone.utc)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "fileName": self.file_name,
            "provider": self.request.provider,
            "sourceLanguage": self.request.source_language,
            "targetLanguage": self.request.target_language,
            "includeBilingual": self.request.include_bilingual,
            "includeMonolingual": self.request.include_monolingual,
            "includeGlossary": self.request.include_glossary,
            "status": self.status.value,
            "progress": self.progress,
            "stage": self.stage,
            "message": self.message,
            "error": self.error,
            "updatedAt": int(self.updated_at.timestamp() * 1000),
            "createdAt": int(self.created_at.timestamp() * 1000),
            "downloads": {
                "mono": bool(self.outputs.mono_pdf and self.outputs.mono_pdf.exists()),
                "dual": bool(self.outputs.dual_pdf and self.outputs.dual_pdf.exists()),
                "source": bool(self.outputs.source_txt and self.outputs.source_txt.exists()),
                "translated": bool(
                    self.outputs.translated_txt and self.outputs.translated_txt.exists()
                ),
                "glossary": bool(
                    self.outputs.glossary_csv and self.outputs.glossary_csv.exists()
                ),
            },
        }
