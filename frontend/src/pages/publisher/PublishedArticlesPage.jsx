import React, { useState, useEffect, useCallback } from "react";
import articleService from "../../services/articleService";
import toast from "react-hot-toast";

const BADGE = (label, color) => (
  <span style={{ background: color + "20", color, padding: "0.15rem 0.5rem", borderRadius: 3, fontSize: "0.75rem", fontWeight: 600, marginRight: "0.35rem" }}>
    {label}
  </span>
);

export default function PublishedArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actioningId, setActioningId] = useState(null);
  const PER_PAGE = 25;

  const fetch = useCallback(() => {
    setLoading(true);
    articleService.listByStatus("published", { page, per_page: PER_PAGE })
      .then(d => { setArticles(d.articles || []); setTotal(d.total || 0); })
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { fetch(); }, [fetch]);

  const toggle = async (field, id, current) => {
    setActioningId(id);
    try {
      if (field === "breaking") await articleService.setBreaking(id, !current);
      else if (field === "featured") await articleService.setFeatured(id, !current);
      else if (field === "editors_pick") await articleService.setEditorsPick(id, !current);
      toast.success("Updated");
      fetch();
    } catch (err) { toast.error(err?.response?.data?.error || err?.message || "Failed to update"); }
    finally { setActioningId(null); }
  };

  const unpublish = async (id) => {
    if (!window.confirm("Unpublish this article?")) return;
    setActioningId(id);
    try {
      await articleService.unpublish(id);
      toast.success("Unpublished");
      fetch();
    } catch (err) { toast.error(err?.response?.data?.error || err?.message || "Failed to unpublish"); }
    finally { setActioningId(null); }
  };

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>Published Articles ({total})</h2>

      {loading ? <p style={{ color: "#6b7280" }}>Loading…</p> : (
        <>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", marginBottom: "1rem" }}>
              <thead>
                <tr style={{ background: "#f3f4f6" }}>
                  {["Title", "By", "Flags", "Published", "Views", "Actions"].map(h => (
                    <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.85rem", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {articles.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#9ca3af" }}>No published articles</td></tr>
                ) : articles.map(art => (
                  <tr key={art.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "0.75rem 1rem", maxWidth: 260 }}>
                      <span style={{ fontWeight: 500, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{art.title}</span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", color: "#6b7280" }}>{art.author_name || "—"}</td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      {art.is_breaking && BADGE("BREAKING", "#dc2626")}
                      {art.is_featured && BADGE("FEATURED", "#7c3aed")}
                      {art.is_editors_pick && BADGE("EDITOR'S PICK", "#0891b2")}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "#6b7280", whiteSpace: "nowrap" }}>
                      {art.publish_date ? new Date(art.publish_date).toLocaleDateString() : "—"}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "#6b7280", fontSize: "0.85rem" }}>{art.view_count || 0}</td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                        <button onClick={() => toggle("breaking", art.id, art.is_breaking)}
                          disabled={actioningId === art.id}
                          title="Toggle Breaking"
                          style={{ padding: "0.25rem 0.55rem", border: `1px solid ${art.is_breaking ? "#dc2626" : "#d1d5db"}`, color: art.is_breaking ? "#dc2626" : "#6b7280", background: "transparent", borderRadius: 3, fontSize: "0.75rem", cursor: "pointer" }}>
                          {art.is_breaking ? "★ Breaking" : "Breaking"}
                        </button>
                        <button onClick={() => toggle("featured", art.id, art.is_featured)}
                          disabled={actioningId === art.id}
                          title="Toggle Featured"
                          style={{ padding: "0.25rem 0.55rem", border: `1px solid ${art.is_featured ? "#7c3aed" : "#d1d5db"}`, color: art.is_featured ? "#7c3aed" : "#6b7280", background: "transparent", borderRadius: 3, fontSize: "0.75rem", cursor: "pointer" }}>
                          {art.is_featured ? "★ Featured" : "Featured"}
                        </button>
                        <button onClick={() => toggle("editors_pick", art.id, art.is_editors_pick)}
                          disabled={actioningId === art.id}
                          title="Toggle Editor's Pick"
                          style={{ padding: "0.25rem 0.55rem", border: `1px solid ${art.is_editors_pick ? "#0891b2" : "#d1d5db"}`, color: art.is_editors_pick ? "#0891b2" : "#6b7280", background: "transparent", borderRadius: 3, fontSize: "0.75rem", cursor: "pointer" }}>
                          {art.is_editors_pick ? "★ Ed. Pick" : "Ed. Pick"}
                        </button>
                        <button onClick={() => unpublish(art.id)}
                          disabled={actioningId === art.id}
                          style={{ padding: "0.25rem 0.55rem", border: "1px solid #ea580c", color: "#ea580c", background: "transparent", borderRadius: 3, fontSize: "0.75rem", cursor: "pointer" }}>
                          Unpublish
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ padding: "0.4rem 0.85rem", border: "1px solid #d1d5db", borderRadius: 4, background: "#fff", cursor: page === 1 ? "default" : "pointer" }}>
                Prev
              </button>
              <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                style={{ padding: "0.4rem 0.85rem", border: "1px solid #d1d5db", borderRadius: 4, background: "#fff", cursor: page === totalPages ? "default" : "pointer" }}>
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
