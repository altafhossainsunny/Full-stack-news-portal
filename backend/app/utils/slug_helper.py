import re
import unicodedata


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = text.lower()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    text = text.strip("-")
    return text


def unique_slug(base: str, checker_fn) -> str:
    """
    checker_fn(slug) -> bool  (True if slug already exists)
    """
    slug = slugify(base)
    candidate = slug
    counter = 1
    while checker_fn(candidate):
        candidate = f"{slug}-{counter}"
        counter += 1
    return candidate
