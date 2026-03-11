import React, { useEffect, useState } from "react";
import articleService from "../../services/articleService";
import toast from "react-hot-toast";

const PER_PAGE = 15;

function ToggleBtn({ active, onClick, label, color }) {
  return (
    <button onClick={onClick}
      style={{ padding: "0.28rem 0.65rem", borderRadius: 6, fontSize: "0.78rem", cursor: "pointer",
        fontWeight: 600, whiteSpace: "nowrap", transition: "all 0.15s",
        border: `1px solid ${active ? color : "rgba(255,255,255,0.1)"}`,
        color: active ? color : "#475569",
        background: active ? `${color}20` : "transparent" }}>
      {active ? `✓ ${label}` : label}
    </button>
  );
}

export default function HomepageControlPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const load = () => {
    setLoading(true);
    articleService.list({ status: "published", page, per_page: PER_PAGE })
      .then(d => {
        setArticles(Array.isArray(d) ? d : (d?.items || d?.articles || []));
        setTotal(d?.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const toggle = async (a, field, label) => {
    try {
      const id = a._id || a.id;
      const val = !a[field];
      if (field === "is_breaking") await articleService.setBreaking(id, val);
      else if (field === "is_featured") await articleService.setFeatured(id, val);
      else if (field === "is_editors_pick") await articleService.setEditorsPick(id, val);
      toast.success(`${label} ${val ? "enabled" : "disabled"}`);
      load();
    } catch { toast.error("Action failed"); }
  };

  return (
    <div>
      <div style={{ marginBottom: "1.75rem" }}>
        <h2 style={{ color: "#f8fafc", fontSize: "1.5rem", margin: "0 0 0.4rem" }}>Homepage Control</h2>
        <p style={{ color: "#64748b", margin: 0, fontSize: "0.88rem" }}>Control which published articles appear as Breaking News, Featured, or Editor's Pick on the public homepage.</p>
      </div>

      <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {[
          { label: "Breaking News", color: "#ef4444" },
          { label: "Featured", color: "#8b5cf6" },
          { label: "Editor's Pick", color: "#f59e0b" },
        ].map(t => (
          <div key={t.label} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ width: 10, height: 10, background: t.color, borderRadius: 2 }} />
            <span style={{ color: "#64748b", fontSize: "0.83rem" }}>{t.label}</span>
          </div>
        ))}
      </div>

      <div style={{ background: "rgba(15,23,42,0.7)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", color: "#e2e8f0" }}>
          <thead style={{ background: "rgba(0,0,0,0.3)" }}>
            <tr>
              {["Title", "Breaking News", "Featured", "Editor's Pick"].map(h => (
                <th key={h} style={{ padding: "0.85rem 1rem", textAlign: "left",
                  fontSize: "0.78rem", color: "#64748b", fontWeight: 600,
                  textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ padding: "3rem", textAlign: "center", color: "#475569" }}>Loading…</td></tr>
            ) : articles.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: "3rem", textAlign: "center", color: "#475569" }}>No published articles yet</td></tr>
            ) : articles.map(a => (
              <tr key={a._id || a.id} style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "0.85rem 1rem", maxWidth: 320 }}>
                  <div style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</div>
                  <div style={{ color: "#475569", fontSize: "0.75rem", marginTop: "0.2rem" }}>{a.publish_date ? new Date(a.publish_date).toLocaleDateString() : ""}</div>
                </td>
                <td style={{ padding: "0.85rem 1rem" }}>
                  <ToggleBtn active={a.is_breaking} color="#ef4444" label="Breaking" onClick={() => toggle(a, "is_breaking", "Breaking News")} />
                </td>
                <td style={{ padding: "0.85rem 1rem" }}>
                  <ToggleBtn active={a.is_featured} color="#8b5cf6" label="Featured" onClick={() => toggle(a, "is_featured", "Featured")} />
                </td>
                <td style={{ padding: "0.85rem 1rem" }}>
                  <ToggleBtn active={a.is_editors_pick} color="#f59e0b" label="Editor's Pick" onClick={() => toggle(a, "is_editors_pick", "Editor's Pick")} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total > PER_PAGE && (
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem", justifyContent: "center", alignItems: "center" }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ padding: "0.4rem 1rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", borderRadius: 6, cursor: "pointer", opacity: page === 1 ? 0.4 : 1 }}>« Prev</button>
          <span style={{ color: "#64748b", fontSize: "0.85rem" }}>Page {page} of {Math.ceil(total / PER_PAGE)}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / PER_PAGE)}
            style={{ padding: "0.4rem 1rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", borderRadius: 6, cursor: "pointer", opacity: page >= Math.ceil(total / PER_PAGE) ? 0.4 : 1 }}>Next »</button>
        </div>
      )}
    </div>
  );
}
