import base64
import logging
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from interviewer.question_generator import generate_questions
from interviewer.conversation_agent import (
    create_session,
    get_session,
    end_session,
    get_initial_greeting,
    process_turn,
    build_transcript,
)
from interviewer.sarvam_service import speech_to_text, text_to_speech

logger = logging.getLogger(__name__)
router = APIRouter()


# ════════════════════════════════════════════════════════════════════
# 1. CUSTOM QUESTION GENERATION
# ════════════════════════════════════════════════════════════════════

class QuestionsRequest(BaseModel):
    role: str
    experience: str
    techStack: str
    duration: Optional[int] = None   # minutes
    resumeText: Optional[str] = None
    count: int = 8


@router.post("/interview/questions")
async def get_questions(req: QuestionsRequest):
    """
    Generate a tailored set of interview questions using OpenAI.
    Mix: 5 technical + 3 behavioral, personalised from resume when provided.
    """
    try:
        questions = await generate_questions(
            role=req.role,
            experience=req.experience,
            tech_stack=req.techStack,
            duration_minutes=req.duration,
            resume_text=req.resumeText,
            count=req.count,
        )
        return {"success": True, "questions": questions}
    except Exception as exc:
        logger.exception("Question generation failed")
        raise HTTPException(status_code=500, detail=str(exc))


# ════════════════════════════════════════════════════════════════════
# 2. CONVERSATIONAL INTERVIEW  (OpenAI LLM + Sarvam STT/TTS)
# ════════════════════════════════════════════════════════════════════

class StartRequest(BaseModel):
    role: str
    experience: str
    techStack: str
    duration: Optional[int] = None   # minutes
    resumeText: Optional[str] = None


@router.post("/interview/conversation/start")
async def conversation_start(req: StartRequest):
    """
    Initialise a new interview session.
    Returns session_id + AI greeting text + base64 WAV audio.
    """
    try:
        session_id = create_session(req.model_dump())
        greeting   = await get_initial_greeting(session_id)
        audio_b64  = await text_to_speech(greeting)

        return {
            "success":    True,
            "session_id": session_id,
            "greeting":   greeting,
            "audio":      audio_b64,   # base64 WAV
        }
    except Exception as exc:
        logger.exception("Conversation start failed")
        raise HTTPException(status_code=500, detail=str(exc))


class TurnRequest(BaseModel):
    session_id:   str
    audio:        str   # base64-encoded audio from browser
    audio_format: str = "webm"


@router.post("/interview/conversation/turn")
async def conversation_turn(req: TurnRequest):
    """
    Process one voice turn:
      1. Sarvam STT  → user transcript
      2. OpenAI      → AI interviewer response
      3. Sarvam TTS  → response audio
    Returns all three plus running turn count.
    """
    session = get_session(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or expired")

    try:
        # STT
        audio_bytes = base64.b64decode(req.audio)
        user_text   = await speech_to_text(audio_bytes, req.audio_format)
    except Exception as exc:
        logger.warning("STT failed: %s", exc)
        return {"success": False, "error": "Could not understand audio. Please try again."}

    try:
        logger.info("STT user_text=%r", user_text)
        # LLM
        ai_response = await process_turn(req.session_id, user_text)

        # TTS
        audio_b64 = await text_to_speech(ai_response)

        return {
            "success":     True,
            "user_text":   user_text,
            "ai_response": ai_response,
            "audio":       audio_b64,
            "turn_count":  session["turn_count"],
        }
    except Exception as exc:
        logger.exception("Conversation turn failed")
        raise HTTPException(status_code=500, detail=str(exc))


class TurnTextRequest(BaseModel):
    session_id: str
    user_text:  str


@router.post("/interview/conversation/turn-text")
async def conversation_turn_text(req: TurnTextRequest):
    """Process a text-only turn (used for timeout / no-response cases)."""
    session = get_session(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or expired")
    try:
        ai_response = await process_turn(req.session_id, req.user_text)
        audio_b64   = await text_to_speech(ai_response)
        return {
            "success":     True,
            "ai_response": ai_response,
            "audio":       audio_b64,
            "turn_count":  session["turn_count"],
        }
    except Exception as exc:
        logger.exception("Text turn failed")
        raise HTTPException(status_code=500, detail=str(exc))


class EndRequest(BaseModel):
    session_id: str


@router.post("/interview/conversation/end")
async def conversation_end(req: EndRequest):
    """
    Close the session and return the full transcript
    in the format expected by /api/interview/feedback.
    """
    transcript = build_transcript(req.session_id)
    end_session(req.session_id)

    return {
        "success":    True,
        "transcript": transcript,
    }
