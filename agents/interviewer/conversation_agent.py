"""In-memory conversational interview session manager backed by OpenAI."""

import os
import time
import uuid
from typing import Optional

import httpx

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_URL = "https://api.openai.com/v1/chat/completions"

_sessions: dict[str, dict] = {}
SESSION_TTL = 3600  # seconds


# ── Session lifecycle ────────────────────────────────────────────────

def create_session(config: dict) -> str:
    session_id   = str(uuid.uuid4())
    duration_min = config.get("duration") or 15
    resume_text  = (config.get("resumeText") or "").strip()

    # How many exchanges fit in the duration (rough: 2 min per Q&A)
    approx_questions = max(3, min(12, duration_min // 2))

    # Build resume section — explicit instruction to reference specific content
    if resume_text:
        resume_section = (
            f"\n\n--- CANDIDATE RESUME ---\n{resume_text[:3000]}\n--- END RESUME ---\n\n"
            "IMPORTANT: You have the candidate's actual resume above. "
            "You MUST reference it actively:\n"
            "- Ask about specific projects, technologies, or companies they listed.\n"
            "- Probe claimed skills with targeted follow-up questions.\n"
            "- If they mention a project, ask about architecture, challenges, and outcomes.\n"
            "- Do NOT ask generic questions that ignore the resume."
        )
    else:
        resume_section = ""

    system_prompt = (
        f"You are an expert technical interviewer conducting a "
        f"{config['experience']}-level interview for a {config['role']} position.\n"
        f"Tech stack: {config['techStack']}.\n"
        f"Session length: {duration_min} minutes (~{approx_questions} questions total)."
        f"{resume_section}\n\n"
        "Conduct the interview following these rules:\n"
        "- CRITICAL: Ask EXACTLY ONE question per turn. Never include two '?' in the same response. If you feel the urge to ask multiple things, pick only the most important one.\n"
        "- Acknowledge each answer in 1 sentence before moving on.\n"
        "- Cover both technical depth and problem-solving approach.\n"
        "- Keep every response under 4 sentences.\n"
        f"- After approximately {approx_questions} exchanges, close with a 2-sentence "
        "performance summary.\n"
        "- Never reveal you are an AI or mention the session duration."
    )

    _sessions[session_id] = {
        "config":     config,
        "history":    [{"role": "system", "content": system_prompt}],
        "created_at": time.time(),
        "turn_count": 0,
    }
    return session_id


def get_session(session_id: str) -> Optional[dict]:
    s = _sessions.get(session_id)
    if s is None:
        return None
    if time.time() - s["created_at"] > SESSION_TTL:
        _sessions.pop(session_id, None)
        return None
    return s


def end_session(session_id: str) -> Optional[dict]:
    return _sessions.pop(session_id, None)


# ── AI interaction ───────────────────────────────────────────────────

async def _call_openai(history: list[dict]) -> str:
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            OPENAI_URL,
            headers={
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model":       "gpt-4o-mini",
                "messages":    history,
                "temperature": 0.7,
                "max_tokens":  300,
            },
        )
        resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"]


async def get_initial_greeting(session_id: str) -> str:
    s = get_session(session_id)
    if not s:
        raise ValueError(f"Session {session_id} not found")

    cfg = s["config"]
    has_resume = bool((cfg.get("resumeText") or "").strip())

    trigger = (
        f"Start the interview. Give a warm 1-sentence greeting, then ask your first question "
        f"for the {cfg['role']} position."
        + (" Your first question should reference something specific from their resume." if has_resume else "")
    )
    return await process_turn(session_id, trigger)


async def process_turn(session_id: str, user_text: str) -> str:
    s = get_session(session_id)
    if not s:
        raise ValueError(f"Session {session_id} not found")

    s["history"].append({"role": "user", "content": user_text})
    ai_text = await _call_openai(s["history"])
    s["history"].append({"role": "assistant", "content": ai_text})
    s["turn_count"] += 1
    return ai_text


def build_transcript(session_id: str) -> list[dict]:
    """Return [{speaker, text}, ...] for the feedback API (excludes system message)."""
    s = _sessions.get(session_id)
    if not s:
        return []
    return [
        {
            "speaker": "AI Interviewer" if m["role"] == "assistant" else "You",
            "text":    m["content"],
        }
        for m in s["history"]
        if m["role"] in ("user", "assistant")
    ]
