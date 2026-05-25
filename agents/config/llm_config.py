import os
from langchain_openai import ChatOpenAI

def create_llm(model: str = "gpt-4o-mini", temperature: float = 0) -> ChatOpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise EnvironmentError("OPENAI_API_KEY is not set")
    return ChatOpenAI(model=model, temperature=temperature, api_key=api_key)
