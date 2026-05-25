from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any

from evaluator.code_evaluator import CodeEvaluatorAgent

router = APIRouter()
agent = CodeEvaluatorAgent()


class EvaluateRequest(BaseModel):
    code:            str
    language:        str
    questionId:      str
    studentId:       str
    errorType:       str
    errorLogs:       list[str]       = []
    failedTestCases: list[dict[str, Any]] = []


@router.post("/evaluate")
async def evaluate(req: EvaluateRequest):
    try:
        result = await agent.evaluate(req.model_dump())
        return result
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {e}")
