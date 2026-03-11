import React, { useState, useEffect, useCallback } from "react";
import articleService from "../../services/articleService";
import toast from "react-hot-toast";

export default function ScheduledArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PER_PAGE = 25;

  const fetchArticles = useCallback(() => {
    setLoading(true);
    // First process any due scheduled articles, then reload the list
    articleService.processScheduled()
      .catch(() => {})
      .finally(() => {
        articleService.listByStatus("scheduled", { page, per_page: PER_PAGE })
          .then(d => { setArticles(d.articles || []); setTotal(d.total || 0); })
          .catch(() => toast.error("Failed to load scheduled articles"))
          .finally(() => setLoading(false));
      });
  }, [page]);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  const publishNow = async (id, title) => {
    if (!window.confirm(`Publish "${title}" immediately?`)) return;
    setActioningId(id);
    try {
      await articleService.publish(id);
      toast.success("Article published!");
      fetchArticles();
    } catch (err) { toast.error(err?.response?.data?.error || err?.message || "Failed to publish"); }
    finally { setActioningId(null); }
  };

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Scheduled Articles</h2>
      <p style={{ color: "#6b7280", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
        Articles queued for scheduled publishing. You can publish them immediately.
      </p>

      {loading ? <p style={{ color: "#6b7280" }}>Loading…</p> : (
        <>
          {articles.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 10, padding: "3rem", textAlign: "center", color: "#9ca3af", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
              No scheduled articles
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", marginBottom: "1rem" }}>
                <thead>
                  <tr style={{ background: "#f3f4f6" }}>
                    {["Title", "Author", "Category", "Scheduled For", "Action"].map(h => (
                      <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.85rem", fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {articles.map(art => (
                    <tr key={art.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "0.75rem 1rem", maxWidth: 280 }}>
                        <span style={{ fontWeight: 500, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{art.title}</span>
                      </td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", color: "#6b7280" }}>{art.author_name || "—"}</td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", color: "#6b7280" }}>{art.category_name || "—"}</td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "#7c3aed", whiteSpace: "nowrap", fontWeight: 500 }}>
                        {art.publish_date ? new Date(art.publish_date).toLocaleString() : "—"}
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <button
                          onClick={() => publishNow(art.id, art.title)}
                          disabled={actioningId === art.id}
                          style={{ padding: "0.35rem 0.85rem", background: "#16a34a", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: "0.82rem", fontWeight: 500 }}>
                          {actioningId === art.id ? "Publishing…" : "Publish Now"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ padding: "0.4rem 0.85rem", border: "1px solid #d1d5db", borderRadius: 4, background: "#fff", cursor: page === 1 ? "default" : "pointer" }}>Prev</button>
              <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                style={{ padding: "0.4rem 0.85rem", border: "1px solid #d1d5db", borderRadius: 4, background: "#fff", cursor: page === totalPages ? "default" : "pointer" }}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
