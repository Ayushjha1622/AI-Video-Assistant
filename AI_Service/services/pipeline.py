from utils.audio_processor import process_input

from core.transcriber import transcribe_all

from core.summarizer import (
    summarize,
    generate_title
)

from core.extractor import (
    extract_action_items,
    extract_key_decisions,
    extract_questions
)

from core.rag_engine import (
    build_rag_chain
)

def run_pipeline(
    source: str,
    language: str,
    collection_name: str = "meeting_transcript"
):

    chunks = process_input(source)

    transcript = transcribe_all(
        chunks,
        language
    )

    title = generate_title(
        transcript
    )

    summary = summarize(
        transcript
    )

    action_items = (
        extract_action_items(
            transcript
        )
    )

    decisions = (
        extract_key_decisions(
            transcript
        )
    )

    questions = (
        extract_questions(
            transcript
        )
    )

    # rag_chain = (
    #     build_rag_chain(
    #         transcript,
    #         collection_name
    #     )
    # )
    rag_chain = None

    return {
        "title": title,
        "transcript": transcript,
        "summary": summary,
        "action_items": action_items,
        "decisions": decisions,
        "questions": questions,
        "rag_chain": rag_chain,
    }