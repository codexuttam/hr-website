import base64
import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
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


# ════════════════════════════════════════════════════════════════════
# 3. WEBSOCKET — real-time interview turns (STT → LLM → TTS)
# ════════════════════════════════════════════════════════════════════

@router.websocket("/interview/ws/{session_id}")
async def ws_interview(websocket: WebSocket, session_id: str):
    """
    Persistent WebSocket for all turn-by-turn conversation after session start.

    Client → server message types:
      {"type": "audio_turn", "audio": "<base64>", "format": "webm|ogg"}
      {"type": "text_turn",  "text": "<string>"}   # timeout / no-response
      {"type": "ping"}

    Server → client message types:
      {"type": "status",      "status": "transcribing|thinking|speaking"}
      {"type": "transcribed", "text": "<user transcript>"}
      {"type": "ai_turn",     "text": "...", "audio": "<base64 WAV>", "turn_count": N}
      {"type": "error",       "message": "..."}
      {"type": "pong"}
    """
    await websocket.accept()

    session = get_session(session_id)
    if not session:
        await websocket.close(code=4004, reason="Session not found or expired")
        return

    logger.info("WS connected: session=%s", session_id)

    try:
        while True:
            msg = await websocket.receive_json()
            msg_type = msg.get("type")

            if msg_type == "audio_turn":
                await _ws_audio_turn(websocket, session_id, msg)
            elif msg_type == "text_turn":
                await _ws_text_turn(websocket, session_id, msg.get("text", ""))
            elif msg_type == "ping":
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        logger.info("WS disconnected: session=%s", session_id)
    except Exception as exc:
        logger.exception("WS error session=%s: %s", session_id, exc)
        try:
            await websocket.send_json({"type": "error", "message": "Internal server error"})
        except Exception:
            pass


async def _ws_audio_turn(websocket: WebSocket, session_id: str, msg: dict) -> None:
    audio_b64    = msg.get("audio", "")
    audio_format = msg.get("format", "webm")

    await websocket.send_json({"type": "status", "status": "transcribing"})
    try:
        audio_bytes = base64.b64decode(audio_b64)
        user_text   = await speech_to_text(audio_bytes, audio_format)
    except Exception as exc:
        logger.warning("WS STT failed session=%s: %s", session_id, exc)
        await websocket.send_json({"type": "error", "message": "Could not understand audio. Please speak clearly."})
        return

    # Send transcript immediately — client shows it before AI responds
    await websocket.send_json({"type": "transcribed", "text": user_text})

    await _ws_llm_tts(websocket, session_id, user_text)


async def _ws_text_turn(websocket: WebSocket, session_id: str, user_text: str) -> None:
    await _ws_llm_tts(websocket, session_id, user_text)


async def _ws_llm_tts(websocket: WebSocket, session_id: str, user_text: str) -> None:
    await websocket.send_json({"type": "status", "status": "thinking"})
    try:
        ai_response = await process_turn(session_id, user_text)
    except Exception as exc:
        logger.exception("WS LLM failed session=%s: %s", session_id, exc)
        await websocket.send_json({"type": "error", "message": "AI response failed."})
        return

    await websocket.send_json({"type": "status", "status": "speaking"})
    try:
        audio_out = await text_to_speech(ai_response)
    except Exception as exc:
        logger.exception("WS TTS failed session=%s: %s", session_id, exc)
        await websocket.send_json({"type": "error", "message": "Audio generation failed."})
        return

    session = get_session(session_id)
    await websocket.send_json({
        "type":       "ai_turn",
        "text":       ai_response,
        "audio":      audio_out,
        "turn_count": session["turn_count"] if session else 0,
    })
