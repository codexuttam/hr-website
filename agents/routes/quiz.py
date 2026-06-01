import os
import json
import httpx
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from openai import AsyncOpenAI

router = APIRouter()

# Schema for the reusable Quiz Generation Request
class QuizGenerateRequest(BaseModel):
    mode: str = Field(..., description="Generation mode: 'topic', 'company', or 'custom'")
    topic: str = Field(..., description="Subject matter or role focus")
    companies: List[str] = Field(default=[], description="List of company names for context")
    customPrompt: Optional[str] = Field(default="", description="Additional guidelines/constraints")
    numQuestions: int = Field(default=5, description="Number of questions to generate")
    difficulty: str = Field(default="medium", description="Difficulty level: 'easy', 'medium', or 'hard'")
    provider: Optional[str] = Field(default="auto", description="Model provider ('openai', 'perplexity', 'auto')")
    title: Optional[str] = Field(default="", description="Optional title for the quiz")

# Schema for the output MCQ Question
class MCQQuestion(BaseModel):
    question: str
    choices: List[str]
    correct_answer: str
    difficulty: str

# Schema for the output Quiz
class QuizResponse(BaseModel):
    title: str
    description: str
    questions: List[MCQQuestion]

async def search_company_info(company: str, topic: str) -> str:
    """
    Uses Perplexity Sonar API to research interview styles, topics, and tech stacks for a company.
    """
    perplexity_key = os.getenv("PERPLEXITY_API_KEY")
    if not perplexity_key:
        print("[quiz-generator] PERPLEXITY_API_KEY not found in environment. Using fallback.")
        return f"Provide standard high-quality technical interview questions relevant to {company} and the role {topic}."

    url = "https://api.perplexity.ai/chat/completions"
    headers = {
        "Authorization": f"Bearer {perplexity_key}",
        "Content-Type": "application/json"
    }
    
    prompt = (
        f"Research the company '{company}' and their technical interview questions, typical topics, tech stack, "
        f"and format for a role focusing on '{topic}'. Focus on giving factual, specific coding and domain-specific "
        f"questions, concepts, and challenges they usually ask."
    )
    
    payload = {
        "model": "sonar",
        "messages": [
            {
                "role": "system", 
                "content": "You are a professional technical recruiter and researcher. Provide detailed, factual insights about company interview processes and technical expectations."
            },
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"[quiz-generator] Perplexity search failed for {company}: {e}")
        return f"Failed to retrieve fresh Perplexity research for {company}. Error: {e}"

async def generate_quiz_with_openai(system_instruction: str, user_prompt: str) -> dict:
    """
    Calls OpenAI Chat Completions using JSON Mode to generate a clean, structured quiz.
    """
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key:
        raise ValueError("OPENAI_API_KEY not found in environment.")
    
    client = AsyncOpenAI(api_key=openai_api_key)
    
    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": user_prompt}
        ],
        response_format={"type": "json_object"},
        temperature=0.7
    )
    
    content = response.choices[0].message.content
    return json.loads(content)

@router.post("/quiz/generate", response_model=QuizResponse)
async def generate_quiz(req: QuizGenerateRequest):
    try:
        research_context = ""
        
        # 1. If company mode is selected, research the companies using Perplexity
        if req.mode == "company" and req.companies:
            research_results = []
            for company in req.companies:
                info = await search_company_info(company, req.topic)
                research_results.append(f"Research results for {company}:\n{info}")
            research_context = "\n\n".join(research_results)

        # 2. Build the LLM prompts
        system_instruction = (
            "You are an expert quiz generator. Your task is to generate a high-quality quiz in strict JSON format. "
            "Every question must have exactly 4 choices, one correct answer (which must match one of the choices exactly), "
            "and a difficulty level matching the requested level. "
            "Do not include any conversational text, explanations, or markdown. Return ONLY raw valid JSON."
        )

        user_prompt = f"""
Generate a quiz with the following settings:
- Topic: {req.topic}
- Mode: {req.mode}
- Number of questions: {req.numQuestions}
- Difficulty: {req.difficulty}
"""

        if req.title:
            user_prompt += f"- Title: {req.title}\n"

        if research_context:
            user_prompt += f"\nUse the following real-time company research to design relevant questions matching their interview style:\n{research_context}\n"

        if req.customPrompt:
            user_prompt += f"\nCustom instructions/constraints:\n{req.customPrompt}\n"

        user_prompt += """
JSON Structure:
{
  "title": "Quiz Title",
  "description": "Short 1-2 line summary of the quiz context",
  "questions": [
    {
      "question": "The question text",
      "choices": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option A", 
      "difficulty": "medium"
    }
  ]
}
"""

        # 3. Request structured quiz from OpenAI
        quiz_data = await generate_quiz_with_openai(system_instruction, user_prompt)
        
        # Validate structure minimally
        if "title" not in quiz_data or "questions" not in quiz_data:
            raise ValueError("LLM returned incomplete quiz object.")
            
        return quiz_data

    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quiz generation failed: {e}")
