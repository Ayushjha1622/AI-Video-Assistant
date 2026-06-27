from fastapi import FastAPI
from fastapi.responses import RedirectResponse

from api.routes.analyze import router as analyze_router
from api.routes.chat import router as chat_router

app = FastAPI(
    title="AI Video Assistant"
)

@app.get("/", include_in_schema=False)
def read_root():
    return RedirectResponse(url="/docs")

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