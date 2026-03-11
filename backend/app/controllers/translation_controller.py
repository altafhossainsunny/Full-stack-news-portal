from flask import request
from ..utils.response_helper import success, error
from ..middleware.auth_middleware import roles_required
from ..services.translation_service import translate_to_english
from ..services.transcription_service import transcribe_audio_file
from ..utils.file_helper import save_file


@roles_required("owner", "publisher", "editor", "reporter")
def translate_text():
    data = request.get_json()
    text = data.get("text", "").strip()
    source_lang = data.get("source_lang")   # optional; auto-detect if not given

    if not text:
        return error("Text is required", 400)
    if len(text) > 10000:
        return error("Text exceeds maximum length of 10,000 characters", 400)

    result = translate_to_english(text, source_lang)
    return success({
        "original": text,
        "translated": result["translated"],
        "detected_language": result.get("detected_language"),
    })


@roles_required("owner", "publisher", "editor", "reporter")
def transcribe_audio():
    if "audio" not in request.files:
        return error("Audio file is required", 400)

    audio_file = request.files["audio"]
    try:
        saved = save_file(audio_file, "temp")
    except ValueError as e:
        return error(str(e), 400)

    result = transcribe_audio_file(saved["url"])
    return success({
        "transcription": result["text"],
        "language": result.get("language"),
    })
