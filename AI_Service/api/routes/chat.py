from fastapi import APIRouter
from api.schemas.chat_schema import ChatRequest
from core.rag_engine import ask_question

router = APIRouter()

@router.post("/")
async def chat(payload: ChatRequest):
    answer = ask_question(
        payload.analysis_id,
        payload.question
    )
    return {
        "answer": answer
    }
