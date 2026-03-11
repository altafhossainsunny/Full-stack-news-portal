ROLES = {
    "OWNER": "owner",
    "PUBLISHER": "publisher",
    "EDITOR": "editor",
    "REPORTER": "reporter",
}

ARTICLE_STATUSES = [
    "draft", "submitted", "under_review", "rejected",
    "approved", "scheduled", "published", "unpublished", "archived",
]

AD_PLACEMENTS = ["header_banner", "sidebar_banner", "article_page_banner", "footer_banner"]

DEFAULT_CATEGORIES = [
    "Bangladesh", "South Asia", "World", "Politics", "Business",
    "Agriculture", "Technology", "Sports", "Health", "Environment",
]

SUPPORTED_LANGUAGES = [
    {"code": "bn", "name": "Bangla"},
    {"code": "ar", "name": "Arabic"},
    {"code": "ru", "name": "Russian"},
    {"code": "ur", "name": "Urdu"},
    {"code": "hi", "name": "Hindi"},
    {"code": "fr", "name": "French"},
    {"code": "es", "name": "Spanish"},
    {"code": "zh", "name": "Chinese"},
    {"code": "en", "name": "English"},
]

INVITATION_EXPIRY_HOURS = 72
MAX_FILE_SIZE_MB = 16
