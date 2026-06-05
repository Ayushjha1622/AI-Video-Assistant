from pydantic import BaseModel

class AnalyzeRequest(BaseModel):
    source: str
    language: str = "english"
    collection_name: str = "meeting_transcript"