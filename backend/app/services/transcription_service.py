import os
from flask import current_app
from openai import OpenAI


def transcribe_audio_file(relative_url: str) -> dict:
    """
    Transcribes an audio file using OpenAI Whisper.
    relative_url is the path relative to Flask app root (e.g. /static/uploads/temp/xyz.mp3)
    Returns dict with 'text' and optional 'language'.
    """
    abs_path = os.path.join(os.getcwd(), "app", relative_url.lstrip("/"))

    if not os.path.exists(abs_path):
        raise FileNotFoundError(f"Audio file not found: {abs_path}")

    client = OpenAI(api_key=current_app.config["OPENAI_API_KEY"])

    with open(abs_path, "rb") as audio_file:
        response = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            response_format="verbose_json",
        )

    # Clean up temp file after transcription
    try:
        os.remove(abs_path)
    except Exception:
        pass

    return {
        "text": response.text,
        "language": getattr(response, "language", None),
    }
