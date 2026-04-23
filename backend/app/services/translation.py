from __future__ import annotations

import time
from typing import Callable, Optional

import requests

ProgressCallback = Optional[Callable[[int, int], None]]

SUPPORTED_PROVIDERS = {"OpenAI", "DeepSeek", "Gemini"}

DEFAULT_MODELS = {
    "OpenAI": "gpt-4o-mini",
    "DeepSeek": "deepseek-chat",
    "Gemini": "gemini-2.0-flash",
}


def split_text_into_chunks(text: str, max_chars: int = 1800) -> list[str]:
    paragraphs = [block.strip() for block in text.split("\n\n") if block.strip()]
    chunks: list[str] = []
    current = ""
    for paragraph in paragraphs:
        candidate = paragraph if not current else f"{current}\n\n{paragraph}"
        if len(candidate) <= max_chars:
            current = candidate
        else:
            if current:
                chunks.append(current)
            if len(paragraph) <= max_chars:
                current = paragraph
            else:
                # Hard split for very long paragraphs.
                for i in range(0, len(paragraph), max_chars):
                    chunks.append(paragraph[i : i + max_chars])
                current = ""
    if current:
        chunks.append(current)
    return chunks or [text]


class TranslationService:
    def __init__(self, provider: str, api_key: str, model: Optional[str] = None):
        if provider not in SUPPORTED_PROVIDERS:
            raise ValueError(f"Unsupported provider: {provider}")
        if not api_key.strip():
            raise ValueError("API key is required.")
        self.provider = provider
        self.api_key = api_key.strip()
        self.model = (model or DEFAULT_MODELS[provider]).strip()

    def translate_chunks(
        self,
        chunks: list[str],
        source_language: str,
        target_language: str,
        progress_callback: ProgressCallback = None,
    ) -> list[str]:
        translated: list[str] = []
        for index, chunk in enumerate(chunks, start=1):
            translated_chunk = self._translate_once(chunk, source_language, target_language)
            translated.append(translated_chunk)
            if progress_callback:
                progress_callback(index, len(chunks))
        return translated

    def _translate_once(self, text: str, source_language: str, target_language: str) -> str:
        prompt = (
            "You are a professional translation engine.\n"
            f"Translate from {source_language} to {target_language}.\n"
            "Return only the translated text.\n\n"
            f"Source text:\n{text}"
        )
        for attempt in range(1, 4):
            try:
                if self.provider in {"OpenAI", "DeepSeek"}:
                    return self._translate_openai_compatible(prompt)
                return self._translate_gemini(prompt)
            except Exception:
                if attempt >= 3:
                    raise
                time.sleep(1.2 * attempt)
        raise RuntimeError("Translation failed after retries.")

    def _translate_openai_compatible(self, prompt: str) -> str:
        if self.provider == "OpenAI":
            endpoint = "https://api.openai.com/v1/chat/completions"
        else:
            endpoint = "https://api.deepseek.com/v1/chat/completions"

        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.1,
        }
        response = requests.post(
            endpoint,
            json=payload,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
            timeout=120,
        )
        response.raise_for_status()
        data = response.json()
        content = data["choices"][0]["message"]["content"]
        if not content:
            raise RuntimeError("Provider returned empty translation content.")
        return str(content).strip()

    def _translate_gemini(self, prompt: str) -> str:
        endpoint = (
            f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent"
            f"?key={self.api_key}"
        )
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.1},
        }
        response = requests.post(endpoint, json=payload, timeout=120)
        response.raise_for_status()
        data = response.json()
        candidates = data.get("candidates") or []
        if not candidates:
            raise RuntimeError("Gemini returned no candidates.")
        parts = candidates[0].get("content", {}).get("parts", [])
        if not parts:
            raise RuntimeError("Gemini returned empty content.")
        text = parts[0].get("text", "")
        if not text:
            raise RuntimeError("Gemini returned empty translation text.")
        return text.strip()
