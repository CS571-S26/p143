from __future__ import annotations

from collections import Counter
from pathlib import Path
import re
from typing import Iterable

from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import simpleSplit
from reportlab.pdfgen import canvas


def _paragraphs(text: str) -> list[str]:
    return [p.strip() for p in text.split("\n\n") if p.strip()]


def build_monolingual_pdf(text: str, output_path: Path, title: str) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(output_path), pagesize=A4)
    width, height = A4
    margin = 40
    y = height - margin
    c.setTitle(title)
    c.setFont("Helvetica", 11)
    line_height = 15

    for paragraph in _paragraphs(text):
        lines = simpleSplit(paragraph, "Helvetica", 11, width - margin * 2)
        for line in lines:
            if y <= margin:
                c.showPage()
                c.setFont("Helvetica", 11)
                y = height - margin
            c.drawString(margin, y, line)
            y -= line_height
        y -= 8

    c.save()


def build_bilingual_pdf(source_chunks: Iterable[str], translated_chunks: Iterable[str], output_path: Path, title: str) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(output_path), pagesize=A4)
    width, height = A4
    margin = 30
    gap = 24
    col_width = (width - margin * 2 - gap) / 2
    left_x = margin
    right_x = margin + col_width + gap
    y = height - margin
    line_height = 13

    c.setTitle(title)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(left_x, y, "Original")
    c.drawString(right_x, y, "Translation")
    y -= 18
    c.setFont("Helvetica", 10)

    for source, translated in zip(source_chunks, translated_chunks):
        left_lines = simpleSplit(source or "", "Helvetica", 10, col_width)
        right_lines = simpleSplit(translated or "", "Helvetica", 10, col_width)
        row_lines = max(len(left_lines), len(right_lines), 1)
        required = row_lines * line_height + 10

        if y - required <= margin:
            c.showPage()
            c.setFont("Helvetica-Bold", 11)
            y = height - margin
            c.drawString(left_x, y, "Original")
            c.drawString(right_x, y, "Translation")
            y -= 18
            c.setFont("Helvetica", 10)

        for i in range(row_lines):
            if i < len(left_lines):
                c.drawString(left_x, y - i * line_height, left_lines[i])
            if i < len(right_lines):
                c.drawString(right_x, y - i * line_height, right_lines[i])

        y -= required

    c.save()


def build_glossary_csv(source_text: str, translated_text: str, output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    token_pattern = re.compile(r"[A-Za-z]{5,}")
    words = [w.lower() for w in token_pattern.findall(source_text)]
    common = [word for word, _ in Counter(words).most_common(20)]

    # This keeps glossary generation lightweight.
    # In a production system you would map each term to translated term alignments.
    with output_path.open("w", encoding="utf-8") as handle:
        handle.write("term,notes\n")
        for word in common:
            handle.write(f"{word},Appears frequently in source text\n")
        handle.write("\n")
        handle.write("translation_preview,generated\n")
        handle.write(f"chars,{len(translated_text)}\n")
