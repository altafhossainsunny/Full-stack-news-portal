import { format, formatDistanceToNow, parseISO } from "date-fns";

export function formatDate(dateStr, pattern = "dd MMM yyyy") {
  if (!dateStr) return "";
  try {
    const date = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
    return format(date, pattern);
  } catch {
    return dateStr;
  }
}

export function timeAgo(dateStr) {
  if (!dateStr) return "";
  try {
    const date = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return dateStr;
  }
}
