from fastapi import FastAPI

from api.routes.analyze import router as analyze_router
from api.routes.chat import router as chat_router

app = FastAPI(
    title="AI Video Assistant"
)

app.include_router(
    analyze_router,
    prefix="/api/analyze",
    tags=["Analyze"]
)

app.include_router(
    chat_router,
    prefix="/api/chat",
    tags=["Chat"]
)