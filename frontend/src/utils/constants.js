export const ROLES = {
  OWNER: "owner",
  PUBLISHER: "publisher",
  EDITOR: "editor",
  REPORTER: "reporter",
};

export const ARTICLE_STATUSES = [
  "draft", "submitted", "under_review", "rejected",
  "approved", "scheduled", "published", "unpublished", "archived",
];

export const STATUS_COLORS = {
  draft: "#6b7280",
  submitted: "#2563eb",
  under_review: "#d97706",
  rejected: "#dc2626",
  approved: "#16a34a",
  scheduled: "#7c3aed",
  published: "#059669",
  unpublished: "#6b7280",
  archived: "#374151",
};

export const SUPPORTED_LANGUAGES = [
  { code: "bn", name: "Bangla" },
  { code: "ar", name: "Arabic" },
  { code: "ru", name: "Russian" },
  { code: "ur", name: "Urdu" },
  { code: "hi", name: "Hindi" },
  { code: "fr", name: "French" },
  { code: "es", name: "Spanish" },
  { code: "zh", name: "Chinese" },
  { code: "en", name: "English" },
];

export const DEFAULT_CATEGORIES = [
  "Bangladesh", "South Asia", "World", "Politics", "Business",
  "Agriculture", "Technology", "Sports", "Health", "Environment",
];
