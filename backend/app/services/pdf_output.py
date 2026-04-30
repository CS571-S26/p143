from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
import re
from typing import Iterable

from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


@dataclass(frozen=True)
class PdfFonts:
    normal: str
    bold: str


@lru_cache(maxsize=1)
def _pdf_fonts() -> PdfFonts:
    font_candidates = [
        (
            "AITranslationNotoSansCJK",
            "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
            "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc",
        ),
        (
            "AITranslationNotoSansSC",
            "/usr/share/fonts/opentype/noto/NotoSansSC-Regular.otf",
            "/usr/share/fonts/opentype/noto/NotoSansSC-Bold.otf",
        ),
        (
            "AITranslationWenQuanYi",
            "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc",
            None,
        ),
        ("AITranslationDengXian", "C:/Windows/Fonts/Deng.ttf", "C:/Windows/Fonts/Dengb.ttf"),
        ("AITranslationNotoSansSC", "C:/Windows/Fonts/NotoSansSC-VF.ttf", None),
        ("AITranslationSimHei", "C:/Windows/Fonts/simhei.ttf", None),
        ("AITranslationMicrosoftYaHei", "C:/Windows/Fonts/msyh.ttc", "C:/Windows/Fonts/msyhbd.ttc"),
        ("AITranslationSimSun", "C:/Windows/Fonts/simsun.ttc", "C:/Windows/Fonts/simsunb.ttf"),
    ]
    for normal_name, normal_path, bold_path in font_candidates:
        normal_file = Path(normal_path)
        if not normal_file.exists():
            continue
        try:
            pdfmetrics.registerFont(TTFont(normal_name, str(normal_file)))
            bold_name = normal_name
            if bold_path and Path(bold_path).exists():
                bold_name = f"{normal_name}Bold"
                pdfmetrics.registerFont(TTFont(bold_name, bold_path))
            return PdfFonts(normal=normal_name, bold=bold_name)
        except Exception:
            continue

    for cid_font in ("STSong-Light", "MSung-Light", "HeiseiMin-W3"):
        try:
            pdfmetrics.registerFont(UnicodeCIDFont(cid_font))
            return PdfFonts(normal=cid_font, bold=cid_font)
        except Exception:
            continue

    return PdfFonts(normal="Helvetica", bold="Helvetica-Bold")


def _paragraphs(text: str) -> list[str]:
    return [p.strip() for p in text.split("\n\n") if p.strip()]


def _break_long_line(text: str, font_name: str, font_size: int, max_width: float) -> list[str]:
    lines: list[str] = []
    current = ""
    for char in text:
        candidate = f"{current}{char}"
        if current and pdfmetrics.stringWidth(candidate, font_name, font_size) > max_width:
            lines.append(current.rstrip())
            current = char.lstrip()
        else:
            current = candidate
    if current:
        lines.append(current.rstrip())
    return lines


def _wrap_text(text: str, font_name: str, font_size: int, max_width: float) -> list[str]:
    lines: list[str] = []
    for raw_line in str(text).splitlines() or [""]:
        split_lines = simpleSplit(raw_line, font_name, font_size, max_width) or [raw_line]
        for line in split_lines:
            if pdfmetrics.stringWidth(line, font_name, font_size) <= max_width:
                lines.append(line)
            else:
                lines.extend(_break_long_line(line, font_name, font_size, max_width))
    return lines


def build_monolingual_pdf(text: str, output_path: Path, title: str) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(output_path), pagesize=A4)
    fonts = _pdf_fonts()
    width, height = A4
    margin = 40
    y = height - margin
    c.setTitle(title)
    c.setFont(fonts.normal, 11)
    line_height = 15

    for paragraph in _paragraphs(text):
        lines = _wrap_text(paragraph, fonts.normal, 11, width - margin * 2)
        for line in lines:
            if y <= margin:
                c.showPage()
                c.setFont(fonts.normal, 11)
                y = height - margin
            c.drawString(margin, y, line)
            y -= line_height
        y -= 8

    c.save()


def build_bilingual_pdf(source_chunks: Iterable[str], translated_chunks: Iterable[str], output_path: Path, title: str) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(output_path), pagesize=A4)
    fonts = _pdf_fonts()
    width, height = A4
    margin = 30
    gap = 24
    col_width = (width - margin * 2 - gap) / 2
    left_x = margin
    right_x = margin + col_width + gap
    y = height - margin
    line_height = 13

    c.setTitle(title)
    c.setFont(fonts.bold, 11)
    c.drawString(left_x, y, "Original")
    c.drawString(right_x, y, "Translation")
    y -= 18
    c.setFont(fonts.normal, 10)

    for source, translated in zip(source_chunks, translated_chunks):
        left_lines = _wrap_text(source or "", fonts.normal, 10, col_width)
        right_lines = _wrap_text(translated or "", fonts.normal, 10, col_width)
        row_lines = max(len(left_lines), len(right_lines), 1)
        required = row_lines * line_height + 10

        if y - required <= margin:
            c.showPage()
            c.setFont(fonts.bold, 11)
            y = height - margin
            c.drawString(left_x, y, "Original")
            c.drawString(right_x, y, "Translation")
            y -= 18
            c.setFont(fonts.normal, 10)

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
