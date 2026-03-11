import React, { useState, useEffect, useCallback } from "react";
import articleService from "../../services/articleService";
import toast from "react-hot-toast";

const BADGE = (label, color) => (
  <span style={{ background: color + "20", color, padding: "0.15rem 0.5rem", borderRadius: 3, fontSize: "0.75rem", fontWeight: 600, marginRight: "0.25rem" }}>
    {label}
  </span>
);

export default function FeaturedStoryControlPage() {
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

  const toggle = async (field, id, current) => {
    const key = id + field;
    setActioningId(key);
    try {
      if (field === "featured") await articleService.setFeatured(id, !current);
      else if (field === "editors_pick") await articleService.setEditorsPick(id, !current);
      toast.success("Updated");
      fetchArticles();
    } catch (err) { toast.error(err?.response?.data?.error || err?.message || "Failed"); }
    finally { setActioningId(null); }
  };

  const featuredCount = articles.filter(a => a.is_featured).length;
  const edPickCount = articles.filter(a => a.is_editors_pick).length;
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Featured Story Control</h2>
      <p style={{ color: "#6b7280", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
        Control which published articles appear as featured or editor's picks.
        Currently <strong>{featuredCount}</strong> featured and <strong>{edPickCount}</strong> editor's pick article{edPickCount !== 1 ? "s" : ""} on this page.
      </p>

      {loading ? <p style={{ color: "#6b7280" }}>Loading…</p> : (
        <>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", marginBottom: "1rem" }}>
              <thead>
                <tr style={{ background: "#f3f4f6" }}>
                  {["Title", "Author", "Published", "Views", "Badges", "Actions"].map(h => (
                    <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.85rem", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {articles.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#9ca3af" }}>No published articles found</td></tr>
                ) : articles.map(art => (
                  <tr key={art.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "0.75rem 1rem", maxWidth: 260 }}>
                      <span style={{ fontWeight: 500, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{art.title}</span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", color: "#6b7280" }}>{art.author_name || "—"}</td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "#6b7280", whiteSpace: "nowrap" }}>
                      {art.publish_date ? new Date(art.publish_date).toLocaleDateString() : "—"}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "#6b7280", fontSize: "0.85rem" }}>{art.view_count || 0}</td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      {art.is_featured && BADGE("FEATURED", "#7c3aed")}
                      {art.is_editors_pick && BADGE("EDITOR'S PICK", "#0891b2")}
                      {!art.is_featured && !art.is_editors_pick && <span style={{ color: "#9ca3af", fontSize: "0.85rem" }}>—</span>}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                        <button
                          onClick={() => toggle("featured", art.id, art.is_featured)}
                          disabled={actioningId === art.id + "featured"}
                          style={{
                            padding: "0.25rem 0.6rem",
                            border: `1px solid ${art.is_featured ? "#7c3aed" : "#d1d5db"}`,
                            color: art.is_featured ? "#7c3aed" : "#374151",
                            background: art.is_featured ? "#f5f3ff" : "#f9fafb",
                            borderRadius: 4, cursor: "pointer", fontSize: "0.78rem", fontWeight: 500
                          }}>
                          {actioningId === art.id + "featured" ? "…" : art.is_featured ? "★ Featured" : "Feature"}
                        </button>
                        <button
                          onClick={() => toggle("editors_pick", art.id, art.is_editors_pick)}
                          disabled={actioningId === art.id + "editors_pick"}
                          style={{
                            padding: "0.25rem 0.6rem",
                            border: `1px solid ${art.is_editors_pick ? "#0891b2" : "#d1d5db"}`,
                            color: art.is_editors_pick ? "#0891b2" : "#374151",
                            background: art.is_editors_pick ? "#ecfeff" : "#f9fafb",
                            borderRadius: 4, cursor: "pointer", fontSize: "0.78rem", fontWeight: 500
                          }}>
                          {actioningId === art.id + "editors_pick" ? "…" : art.is_editors_pick ? "★ Ed. Pick" : "Ed. Pick"}
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
