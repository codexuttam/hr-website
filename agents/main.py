import os
from dotenv import load_dotenv
load_dotenv()

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.evaluate  import router as evaluate_router
from routes.interview import router as interview_router

app = FastAPI(title="HR Agents", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(evaluate_router,  prefix="/api")
app.include_router(interview_router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "hr-agents", "version": "2.0.0"}


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
