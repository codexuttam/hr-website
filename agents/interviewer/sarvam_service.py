"""Sarvam AI — Speech-to-Text and Text-to-Speech."""

import os
import httpx

SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")
STT_URL = "https://api.sarvam.ai/speech-to-text"
TTS_URL = "https://api.sarvam.ai/text-to-speech"


async def speech_to_text(audio_bytes: bytes, audio_format: str = "webm") -> str:
    """Convert audio bytes → transcript string via Sarvam STT."""
    if not SARVAM_API_KEY:
        raise ValueError("SARVAM_API_KEY is not configured")

    async with httpx.AsyncClient(timeout=30.0) as client:
        files = {"file": (f"audio.{audio_format}", audio_bytes, f"audio/{audio_format}")}
        data  = {"model": "saarika:v2.5", "language_code": "en-IN"}
        headers = {"api-subscription-key": SARVAM_API_KEY}

        resp = await client.post(STT_URL, files=files, data=data, headers=headers)
        if not resp.is_success:
            print(f"[Sarvam STT] {resp.status_code} — {resp.text}")
        resp.raise_for_status()

    result = resp.json()
    print(f"[Sarvam STT] full response: {result}")
    # v2 uses "transcript", v2.5 may use "text" or "transcription"
    transcript = (
        result.get("transcript") or
        result.get("text") or
        result.get("transcription") or
        ""
    ).strip()
    if not transcript:
        raise ValueError(f"Sarvam STT returned no transcript. Response: {result}")
    return transcript


async def text_to_speech(text: str, speaker: str = "anushka") -> str:
    """Convert text → base64-encoded WAV audio via Sarvam TTS."""
    if not SARVAM_API_KEY:
        raise ValueError("SARVAM_API_KEY is not configured")

    payload = {
        "inputs": [text[:500]],          # Sarvam cap per input
        "target_language_code": "en-IN",
        "speaker": speaker,
        "pitch": 0,
        "pace": 0.8,
        "loudness": 2.0,
        "speech_sample_rate": 22050,
        "enable_preprocessing": True,
        "model": "bulbul:v2",
    }
    headers = {
        "api-subscription-key": SARVAM_API_KEY,
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(TTS_URL, json=payload, headers=headers)
        if not resp.is_success:
            print(f"[Sarvam TTS] {resp.status_code} — {resp.text}")
        resp.raise_for_status()

    audios = resp.json().get("audios", [])
    if not audios:
        raise ValueError("Sarvam TTS returned no audio")
    return audios[0]  # base64-encoded WAV
