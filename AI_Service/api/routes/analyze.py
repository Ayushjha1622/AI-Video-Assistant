from fastapi import APIRouter

from api.schemas.analyze_schema import (
    AnalyzeRequest
)

from services.pipeline import (
    run_pipeline
)

router = APIRouter()

@router.post("/")
async def analyze_video(
    payload: AnalyzeRequest
):

    result = run_pipeline(
        payload.source,
        payload.language,
        payload.collection_name
    )

    return {
        "success": True,
        "data": {
            "title":
                result["title"],

            "summary":
                result["summary"],

            "action_items":
                result["action_items"],

            "decisions":
                result["decisions"],

            "questions":
                result["questions"]
        }
    }