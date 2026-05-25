"""Generate tailored interview questions via OpenAI."""

import json
import os
from typing import Optional

import httpx

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_URL = "https://api.openai.com/v1/chat/completions"


async def generate_questions(
    role: str,
    experience: str,
    tech_stack: str,
    duration_minutes: Optional[int] = None,
    resume_text: Optional[str] = None,
    count: int = 8,
) -> list[str]:

    resume_text = (resume_text or "").strip()

    # Scale question count to duration if provided (rough: 3-4 min per question)
    if duration_minutes:
        count = max(4, min(15, duration_minutes // 3))

    if resume_text:
        resume_section = (
            f"\n\n--- CANDIDATE RESUME ---\n{resume_text[:3000]}\n--- END RESUME ---\n\n"
            "MANDATORY resume-based requirements:\n"
            f"- At least {max(2, count // 3)} questions MUST directly reference specific "
            "projects, technologies, companies, or achievements listed in the resume above.\n"
            "- Ask about concrete details: architecture decisions, scale, challenges overcome, "
            "your specific contribution vs the team's.\n"
            "- If the resume lists a technology, probe their depth (not just 'have you used X?').\n"
            "- Do NOT ask questions that could apply to any candidate — make them resume-specific."
        )
    else:
        resume_section = ""

    prompt = (
        f"You are an expert technical interviewer. Generate exactly {count} interview questions "
        f"for a {experience}-level {role} position.\n"
        f"Tech stack: {tech_stack}."
        f"{resume_section}\n\n"
        f"Question mix:\n"
        f"- {max(1, count - count // 3)} technical questions specific to the tech stack and role\n"
        f"- {count // 3} behavioral / situational questions\n\n"
        "Requirements for all questions:\n"
        "- Each question must be standalone and self-contained.\n"
        "- No yes/no questions — ask open-ended questions that require explanation.\n"
        "- Order from warm-up → core technical → advanced → behavioral.\n\n"
        "Return ONLY a valid JSON array of strings — no markdown, no explanation:\n"
        '["question 1", "question 2", ...]'
    )

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            OPENAI_URL,
            headers={
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model":       "gpt-4o-mini",
                "messages":    [{"role": "user", "content": prompt}],
                "temperature": 0.7,
                "max_tokens":  1200,
            },
        )
        resp.raise_for_status()

    text  = resp.json()["choices"][0]["message"]["content"]
    clean = text.replace("```json", "").replace("```", "").strip()
    questions = json.loads(clean)

    if not isinstance(questions, list):
        raise ValueError("AI did not return a list of questions")

    return [str(q) for q in questions]
