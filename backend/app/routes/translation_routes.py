from flask import Blueprint
from ..controllers.translation_controller import translate_text, transcribe_audio

translation_bp = Blueprint("translations", __name__)

translation_bp.post("/translate")(translate_text)
translation_bp.post("/transcribe")(transcribe_audio)
