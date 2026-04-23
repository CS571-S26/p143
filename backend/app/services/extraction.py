from __future__ import annotations

import contextlib
from dataclasses import dataclass
import importlib
import io
from pathlib import Path
from typing import Callable, Optional

import fitz

ProgressCallback = Optional[Callable[[int, int], None]]


@dataclass
class ExtractionResult:
    full_text: str
    page_count: int
    used_ocr: bool
    ocr_pages: int


_OCR_ENGINE = None
_RAPIDOCR_UNAVAILABLE = False


def _get_ocr_engine():
    global _OCR_ENGINE, _RAPIDOCR_UNAVAILABLE
    if _OCR_ENGINE is not None or _RAPIDOCR_UNAVAILABLE:
        return _OCR_ENGINE
    try:
        # Keep optional OCR dependency fully lazy to avoid startup failures
        # when onnxruntime and local numpy binaries are mismatched.
        with contextlib.redirect_stderr(io.StringIO()):
            module = importlib.import_module("rapidocr_onnxruntime")
        _OCR_ENGINE = module.RapidOCR()
    except Exception:
        _RAPIDOCR_UNAVAILABLE = True
        return None
    return _OCR_ENGINE


def _ocr_page(page: fitz.Page) -> str:
    engine = _get_ocr_engine()
    if engine is None:
        return ""
    pix = page.get_pixmap(matrix=fitz.Matrix(2.0, 2.0))
    img_bytes = pix.tobytes("png")
    result, _ = engine(img_bytes)
    if not result:
        return ""
    lines: list[str] = []
    for item in result:
        if isinstance(item, (list, tuple)) and len(item) >= 2 and item[1]:
            lines.append(str(item[1]).strip())
    return "\n".join(line for line in lines if line)


def extract_document_text(file_path: Path, progress_callback: ProgressCallback = None) -> ExtractionResult:
    suffix = file_path.suffix.lower()
    if suffix == ".txt":
        text = file_path.read_text(encoding="utf-8", errors="ignore").strip()
        return ExtractionResult(full_text=text, page_count=1, used_ocr=False, ocr_pages=0)
    if suffix != ".pdf":
        raise ValueError("Unsupported input file. Only PDF and TXT are supported.")

    doc = fitz.open(file_path)
    page_texts: list[str] = []
    used_ocr = False
    ocr_pages = 0

    for index, page in enumerate(doc, start=1):
        if progress_callback:
            progress_callback(index, len(doc))

        raw_text = (page.get_text("text") or "").strip()
        compact_len = len("".join(raw_text.split()))

        # Similar to PDFMathTranslate-style fallback: if text extraction is weak,
        # run OCR on rendered page image.
        if compact_len < 80:
            ocr_text = _ocr_page(page).strip()
            if ocr_text:
                raw_text = ocr_text
                used_ocr = True
                ocr_pages += 1

        if raw_text:
            page_texts.append(raw_text)

    doc.close()

    full_text = "\n\n".join(page_texts).strip()
    if not full_text:
        raise ValueError(
            "Could not extract text from the document. The file may be image-only and OCR is unavailable."
        )
    return ExtractionResult(
        full_text=full_text,
        page_count=len(page_texts),
        used_ocr=used_ocr,
        ocr_pages=ocr_pages,
    )
