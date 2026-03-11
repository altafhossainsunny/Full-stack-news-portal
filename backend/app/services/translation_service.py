import os
from flask import current_app
from openai import OpenAI


def translate_to_english(text: str, source_lang: str = None) -> dict:
    """
    Uses OpenAI GPT to translate text to English.
    Returns dict with 'translated' and optional 'detected_language'.
    """
    client = OpenAI(api_key=current_app.config["OPENAI_API_KEY"])

    lang_hint = f" The source language is {source_lang}." if source_lang else ""
    prompt = (
        f"Translate the following text to English.{lang_hint} "
        "Return only the translated text, no explanations.\n\n"
        f"{text}"
    )

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=4096,
        temperature=0.3,
    )

    translated = response.choices[0].message.content.strip()

    detected = None
    if not source_lang:
        try:
            from langdetect import detect
            detected = detect(text)
        except Exception:
            pass

    return {"translated": translated, "detected_language": detected}
