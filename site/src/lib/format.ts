import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: true });

/** Render markdown -> HTML string, falling back to escaped plain text. */
export function renderMarkdown(md: string | undefined): string {
  if (!md) return "";
  try {
    return marked.parse(md) as string;
  } catch {
    return String(md)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }
}

export function formatDate(dateText: string | undefined): string {
  if (!dateText) return "";
  const d = new Date(dateText);
  if (Number.isNaN(d.getTime())) return dateText;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}
