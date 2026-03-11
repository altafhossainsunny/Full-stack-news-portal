import React, { useState, useEffect, useCallback } from "react";
import articleService from "../../services/articleService";
import toast from "react-hot-toast";

export default function BreakingNewsControlPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PER_PAGE = 25;

  const fetchArticles = useCallback(() => {
    setLoading(true);
    articleService.listByStatus("published", { page, per_page: PER_PAGE })
      .then(d => { setArticles(d.articles || []); setTotal(d.total || 0); })
      .catch(() => toast.error("Failed to load articles"))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  const toggleBreaking = async (id, current) => {
    setActioningId(id);
    try {
      await articleService.setBreaking(id, !current);
      toast.success(current ? "Breaking news removed" : "Breaking news set");
      fetchArticles();
    } catch (err) { toast.error(err?.response?.data?.error || err?.message || "Failed"); }
    finally { setActioningId(null); }
  };

  const breakingArticles = articles.filter(a => a.is_breaking);
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Breaking News Control</h2>
      <p style={{ color: "#6b7280", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
        Mark published articles as breaking news. Currently <strong>{breakingArticles.length}</strong> article{breakingArticles.length !== 1 ? "s" : ""} marked as breaking on this page.
      </p>

      {breakingArticles.length > 0 && (
        <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
          <p style={{ margin: "0 0 0.5rem", fontWeight: 700, color: "#dc2626", fontSize: "0.875rem" }}>🔴 Active Breaking News:</p>
          {breakingArticles.map(a => (
            <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.4rem" }}>
              <span style={{ fontSize: "0.875rem", color: "#374151", flex: 1, marginRight: "1rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</span>
              <button
                onClick={() => toggleBreaking(a.id, true)}
                disabled={actioningId === a.id}
                style={{ padding: "0.2rem 0.65rem", background: "#dc2626", color: "#fff", border: "none", borderRadius: 3, cursor: "pointer", fontSize: "0.75rem", flexShrink: 0 }}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {loading ? <p style={{ color: "#6b7280" }}>Loading…</p> : (
        <>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", marginBottom: "1rem" }}>
              <thead>
                <tr style={{ background: "#f3f4f6" }}>
                  {["Title", "Author", "Published", "Views", "Status", "Action"].map(h => (
                    <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.85rem", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {articles.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#9ca3af" }}>No published articles found</td></tr>
                ) : articles.map(art => (
                  <tr key={art.id} style={{ borderTop: "1px solid #f3f4f6", background: art.is_breaking ? "#fff5f5" : "transparent" }}>
                    <td style={{ padding: "0.75rem 1rem", maxWidth: 280 }}>
                      <span style={{ fontWeight: 500, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{art.title}</span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", color: "#6b7280" }}>{art.author_name || "—"}</td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "#6b7280", whiteSpace: "nowrap" }}>
                      {art.publish_date ? new Date(art.publish_date).toLocaleDateString() : "—"}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "#6b7280", fontSize: "0.85rem" }}>{art.view_count || 0}</td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      {art.is_breaking
                        ? <span style={{ background: "#fee2e2", color: "#dc2626", padding: "0.2rem 0.6rem", borderRadius: 4, fontSize: "0.78rem", fontWeight: 700 }}>🔴 BREAKING</span>
                        : <span style={{ color: "#9ca3af", fontSize: "0.85rem" }}>—</span>}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <button
                        onClick={() => toggleBreaking(art.id, art.is_breaking)}
                        disabled={actioningId === art.id}
                        style={{
                          padding: "0.3rem 0.75rem",
                          border: `1px solid ${art.is_breaking ? "#dc2626" : "#d1d5db"}`,
                          color: art.is_breaking ? "#dc2626" : "#374151",
                          background: art.is_breaking ? "#fee2e2" : "#f9fafb",
                          borderRadius: 4, cursor: "pointer", fontSize: "0.8rem", fontWeight: 500
                        }}>
                        {actioningId === art.id ? "…" : art.is_breaking ? "Remove Breaking" : "Set Breaking"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
