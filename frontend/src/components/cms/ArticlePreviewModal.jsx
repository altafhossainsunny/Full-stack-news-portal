import React, { useEffect, useState } from "react";
import articleService from "../../services/articleService";

/**
 * Full-article preview modal for publisher/owner review workflows.
 * Usage: <ArticlePreviewModal articleId={id} onClose={() => setPreviewId(null)} />
 */
export default function ArticlePreviewModal({ articleId, onClose }) {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    if (!articleId) return;
    setArticle(null);
    setFetchError(null);
    setLoading(true);
    articleService.get(articleId)
      .then(setArticle)
      .catch(() => setFetchError("Failed to load article. Please try again."))
      .finally(() => setLoading(false));
  }, [articleId]);

  if (!articleId) return null;

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const statusColors = {
    draft: "#94a3b8", submitted: "#60a5fa", approved: "#34d399",
    published: "#4ade80", rejected: "#f87171", scheduled: "#a78bfa",
    unpublished: "#94a3b8", archived: "#64748b",
  };

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        zIndex: 1000, overflowY: "auto", padding: "2rem 1rem 4rem",
      }}
    >
      <div style={{
        background: "#fff", borderRadius: 12, width: "100%", maxWidth: 820,
        boxShadow: "0 12px 48px rgba(0,0,0,0.4)", position: "relative",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "1rem 1.5rem", borderBottom: "1px solid #f3f4f6", position: "sticky",
          top: 0, background: "#fff", borderRadius: "12px 12px 0 0", zIndex: 1,
        }}>
          <span style={{ fontWeight: 700, fontSize: "1rem", color: "#111827" }}>
            📄 Article Preview
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", fontSize: "1.6rem",
              cursor: "pointer", color: "#9ca3af", lineHeight: 1, padding: "0 0.25rem",
            }}
          >×</button>
        </div>

        {/* Body */}
        <div style={{ padding: "2rem 2.5rem 3rem" }}>
          {loading && (
            <p style={{ textAlign: "center", color: "#9ca3af", padding: "4rem 0", fontSize: "1rem" }}>
              Loading article…
            </p>
          )}
          {fetchError && (
            <p style={{ textAlign: "center", color: "#dc2626", padding: "4rem 0" }}>{fetchError}</p>
          )}
          {article && (
            <>
              {/* Featured image */}
              {article.featured_image && (
                <img
                  src={article.featured_image}
                  alt={article.title}
                  style={{
                    width: "100%", maxHeight: 400, objectFit: "cover",
                    borderRadius: 8, marginBottom: "1.5rem",
                  }}
                />
              )}

              {/* Badges: category, status, breaking, tags */}
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                {article.category_name && (
                  <span style={{
                    padding: "0.2rem 0.65rem", background: "#dbeafe", color: "#1d4ed8",
                    borderRadius: 4, fontSize: "0.78rem", fontWeight: 600,
                  }}>{article.category_name}</span>
                )}
                {article.corner_name && (
                  <span style={{
                    padding: "0.2rem 0.65rem", background: "#f3e8ff", color: "#7c3aed",
                    borderRadius: 4, fontSize: "0.78rem", fontWeight: 600,
                  }}>{article.corner_name}</span>
                )}
                {article.is_breaking && (
                  <span style={{
                    padding: "0.2rem 0.65rem", background: "#fee2e2", color: "#dc2626",
                    borderRadius: 4, fontSize: "0.78rem", fontWeight: 700,
                  }}>🔴 BREAKING</span>
                )}
                {article.status && (
                  <span style={{
                    padding: "0.2rem 0.65rem", borderRadius: 4, fontSize: "0.78rem",
                    fontWeight: 500, textTransform: "capitalize",
                    background: `${statusColors[article.status] || "#94a3b8"}20`,
                    color: statusColors[article.status] || "#94a3b8",
                    border: `1px solid ${statusColors[article.status] || "#94a3b8"}40`,
                  }}>{article.status.replace("_", " ")}</span>
                )}
                {(article.tags || []).map(t => (
                  <span key={t} style={{
                    padding: "0.2rem 0.65rem", background: "#f9fafb",
                    color: "#6b7280", borderRadius: 4, fontSize: "0.78rem",
                    border: "1px solid #e5e7eb",
                  }}>#{t}</span>
                ))}
              </div>

              {/* Title */}
              <h1 style={{
                fontSize: "1.9rem", fontWeight: 800, lineHeight: 1.2,
                color: "#111827", margin: "0 0 0.6rem",
              }}>{article.title}</h1>

              {/* Subtitle */}
              {article.subtitle && (
                <h2 style={{
                  fontSize: "1.15rem", fontWeight: 400, color: "#4b5563",
                  margin: "0 0 1rem", lineHeight: 1.4,
                }}>{article.subtitle}</h2>
              )}

              {/* Byline */}
              <div style={{
                fontSize: "0.85rem", color: "#9ca3af", marginBottom: "1.5rem",
                paddingBottom: "1.25rem", borderBottom: "1px solid #f3f4f6",
                display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center",
              }}>
                <span>By <strong style={{ color: "#374151" }}>{article.author_name || "Unknown"}</strong></span>
                {article.updated_at && (
                  <span>· Last updated {new Date(article.updated_at).toLocaleString()}</span>
                )}
                {article.publish_date && article.status === "scheduled" && (
                  <span style={{ color: "#7c3aed", fontWeight: 500 }}>
                    · Scheduled for {new Date(article.publish_date).toLocaleString()}
                  </span>
                )}
              </div>

              {/* Summary */}
              {article.summary && (
                <p style={{
                  fontSize: "1.05rem", color: "#374151", marginBottom: "1.75rem",
                  fontStyle: "italic", lineHeight: 1.65,
                  padding: "1rem 1.25rem", background: "#f9fafb",
                  borderLeft: "4px solid #e5e7eb", borderRadius: "0 8px 8px 0",
                }}>{article.summary}</p>
              )}

              {/* Full content */}
              <div
                dangerouslySetInnerHTML={{ __html: article.content }}
                style={{
                  fontSize: "0.98rem", lineHeight: 1.8, color: "#1f2937",
                  wordBreak: "break-word",
                }}
              />

              {/* Rejection / return note */}
              {article.rejection_reason && (
                <div style={{
                  marginTop: "2rem", padding: "1rem 1.25rem",
                  background: "#fef2f2", borderRadius: 8, border: "1px solid #fecaca",
                }}>
                  <strong style={{ color: "#dc2626", fontSize: "0.85rem" }}>
                    Rejection / Return Note:{" "}
                  </strong>
                  <span style={{ color: "#7f1d1d", fontSize: "0.85rem" }}>{article.rejection_reason}</span>
                </div>
              )}

              {/* SEO meta (collapsible feel — show dimmed) */}
              {(article.seo_title || article.seo_description) && (
                <div style={{
                  marginTop: "2rem", padding: "1rem 1.25rem",
                  background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0",
                }}>
                  <p style={{ margin: "0 0 0.35rem", fontSize: "0.78rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>SEO</p>
                  {article.seo_title && <p style={{ margin: "0 0 0.25rem", fontSize: "0.88rem", color: "#374151" }}><strong>Title:</strong> {article.seo_title}</p>}
                  {article.seo_description && <p style={{ margin: 0, fontSize: "0.88rem", color: "#374151" }}><strong>Description:</strong> {article.seo_description}</p>}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer close button */}
        <div style={{
          padding: "1rem 2.5rem", borderTop: "1px solid #f3f4f6",
          display: "flex", justifyContent: "flex-end",
        }}>
          <button
            onClick={onClose}
            style={{
              padding: "0.55rem 1.5rem", background: "#1f2937", color: "#fff",
              border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 500,
            }}
          >Close Preview</button>
        </div>
      </div>
    </div>
  );
}
