import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import articleService from "../../services/articleService";
import toast from "react-hot-toast";

const STATUS_STYLES = {
  draft: { bg: "#f3f4f6", color: "#374151" },
  submitted: { bg: "#fef3c720", color: "#d97706" },
  approved: { bg: "#d1fae520", color: "#059669" },
  rejected: { bg: "#fee2e220", color: "#dc2626" },
  returned: { bg: "#ffedd520", color: "#ea580c" },
  published: { bg: "#dbeafe20", color: "#2563eb" },
};

export default function MyArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PER_PAGE = 20;

  const fetch = useCallback(() => {
    setLoading(true);
    articleService.myArticles({ status: statusFilter, page, per_page: PER_PAGE })
      .then(d => { setArticles(d.articles || []); setTotal(d.total || 0); })
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, [statusFilter, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.5rem" }}>My Articles ({total})</h2>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            style={{ padding: "0.5rem 1rem", border: "1px solid #d1d5db", borderRadius: 6 }}>
            <option value="">All Statuses</option>
            {["draft", "submitted", "approved", "rejected", "returned", "published"].map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <Link to="/editor/articles/create"
            style={{ padding: "0.55rem 1.1rem", background: "#16a34a", color: "#fff", borderRadius: 6, textDecoration: "none", fontSize: "0.9rem" }}>
            + New Article
          </Link>
        </div>
      </div>

      {loading ? <p style={{ color: "#6b7280" }}>Loading…</p> : (
        <>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", marginBottom: "1rem" }}>
              <thead>
                <tr style={{ background: "#f3f4f6" }}>
                  {["Title", "Status", "Category", "Last Updated", "Actions"].map(h => (
                    <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.85rem", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {articles.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#9ca3af" }}>No articles found</td></tr>
                ) : articles.map(art => {
                  const st = STATUS_STYLES[art.status] || STATUS_STYLES.draft;
                  return (
                    <tr key={art.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "0.75rem 1rem", maxWidth: 280 }}>
                        <span style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{art.title}</span>
                        {art.rejection_reason && (
                          <span style={{ fontSize: "0.78rem", color: "#dc2626", display: "block", marginTop: "0.2rem" }}>
                            Note: {art.rejection_reason.slice(0, 80)}{art.rejection_reason.length > 80 ? "…" : ""}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <span style={{ background: st.bg, color: st.color, padding: "0.2rem 0.6rem", borderRadius: 4, fontSize: "0.8rem", fontWeight: 600 }}>
                          {art.status}
                        </span>
                      </td>
                      <td style={{ padding: "0.75rem 1rem", color: "#6b7280", fontSize: "0.85rem" }}>{art.category_name || "—"}</td>
                      <td style={{ padding: "0.75rem 1rem", color: "#9ca3af", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                        {art.updated_at ? new Date(art.updated_at).toLocaleDateString() : "—"}
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        {["draft", "returned"].includes(art.status) && (
                          <Link to={`/editor/articles/${art.id}/edit`}
                            style={{ padding: "0.3rem 0.7rem", border: "1px solid #16a34a", color: "#16a34a", borderRadius: 4, fontSize: "0.8rem", textDecoration: "none" }}>
                            Edit
                          </Link>
                        )}
                        {art.status === "published" && (
                          <a href={`/article/${art.slug}`} target="_blank" rel="noreferrer"
                            style={{ padding: "0.3rem 0.7rem", border: "1px solid #0891b2", color: "#0891b2", borderRadius: 4, fontSize: "0.8rem", textDecoration: "none" }}>
                            View
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
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
