import json
import logging
from typing import Any

from langchain_core.output_parsers import JsonOutputParser
from langchain_core.runnables import RunnableSequence

from config.llm_config import create_llm
from prompts.evaluation_prompts import evaluation_prompt

logger = logging.getLogger(__name__)


def _format_failed_cases(failed_cases: list[dict]) -> str:
    if not failed_cases:
        return "None"
    lines = []
    for tc in failed_cases:
        lines.append(
            f"Test {tc.get('id', '?')}:\n"
            f"  Input:    {tc.get('input', '')}\n"
            f"  Expected: {tc.get('expectedOutput', '')}\n"
            f"  Actual:   {tc.get('actualOutput', '')}\n"
            f"  Error:    {tc.get('errorDetail') or 'output mismatch'}"
        )
    return "\n".join(lines)


def _format_error_logs(logs: list[str]) -> str:
    return "\n".join(logs) if logs else "No error logs captured."


class CodeEvaluatorAgent:
    """LangChain chain that classifies a student's code error and suggests a fix."""

    def __init__(self):
        llm = create_llm()
        self._chain: RunnableSequence = evaluation_prompt | llm | JsonOutputParser()

    async def evaluate(self, payload: dict[str, Any]) -> dict[str, Any]:
        """
        payload keys:
          code, language, questionId, studentId,
          errorType, errorLogs, failedTestCases
        """
        try:
            result = await self._chain.ainvoke({
                "language":          payload.get("language", "unknown"),
                "question_id":       payload.get("questionId", "N/A"),
                "error_type":        payload.get("errorType", "unknown"),
                "code":              payload.get("code", ""),
                "error_logs":        _format_error_logs(payload.get("errorLogs", [])),
                "failed_test_cases": _format_failed_cases(payload.get("failedTestCases", [])),
            })

            # Ensure required keys exist
            return {
                "mistakeCategory": result.get("mistakeCategory", "Unknown"),
                "severity":        result.get("severity",        "medium"),
                "explanation":     result.get("explanation",     ""),
                "suggestedFix":    result.get("suggestedFix",    ""),
            }

        except json.JSONDecodeError as e:
            logger.error("JSON parse error from LLM: %s", e)
            raise ValueError(f"LLM returned invalid JSON: {e}") from e
        except Exception as e:
            logger.error("Evaluation failed: %s", e)
            raise