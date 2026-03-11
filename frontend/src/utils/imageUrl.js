const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

/**
 * Converts any YouTube / Vimeo URL the user types into a valid embed URL.
 * All other URLs are passed through unchanged.
 *
 * Handles:
 *   https://www.youtube.com/watch?v=VIDEO_ID
 *   https://youtu.be/VIDEO_ID
 *   https://www.youtube.com/live/VIDEO_ID
 *   https://www.youtube.com/shorts/VIDEO_ID
 *   https://www.youtube.com/embed/VIDEO_ID  ← already correct, pass-through
 *   https://vimeo.com/VIDEO_ID
 */
export function toEmbedUrl(url) {
  if (!url) return "";

  // Already an embed URL — pass through
  if (url.includes("youtube.com/embed/") || url.includes("player.vimeo.com/")) {
    return url;
  }

  // youtube.com/watch?v=ID  or  youtu.be/ID  or  youtube.com/live/ID  or  youtube.com/shorts/ID
  const ytPatterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,          // watch?v=
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,      // youtu.be/
    /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/, // /live/
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/, // /shorts/
  ];
  for (const re of ytPatterns) {
    const m = url.match(re);
    if (m) return `https://www.youtube.com/embed/${m[1]}?autoplay=0&rel=0`;
  }

  // vimeo.com/VIDEO_ID
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;

  return url;
}

/**
 * Returns an absolute URL for an image path.
 * - Already absolute URLs are passed through unchanged.
 * - Relative paths (e.g. /static/uploads/...) are prefixed with the API base.
 */
export function imgUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE}${path}`;
}

/**
 * Rewrites relative /static/ image src attributes inside an HTML string to absolute URLs.
 * Use this when rendering server-generated HTML via dangerouslySetInnerHTML.
 */
export function fixContentImages(html) {
  if (!html) return html;
  return html.replace(/src="(\/static\/[^"]+)"/g, `src="${API_BASE}$1"`);
}
