import React, { useEffect, useState } from "react";
import articleService from "../../services/articleService";
import ArticlePreviewModal from "../../components/cms/ArticlePreviewModal";
import toast from "react-hot-toast";

const STATUSES = ["all", "draft", "submitted", "approved", "scheduled", "published", "rejected", "unpublished", "archived"];

const STATUS_COLORS = {
  draft:       { text: "#94a3b8", border: "#94a3b840" },
  submitted:   { text: "#60a5fa", border: "#60a5fa40" },
  under_review:{ text: "#fbbf24", border: "#fbbf2440" },
  approved:    { text: "#34d399", border: "#34d39940" },
  published:   { text: "#4ade80", border: "#4ade8040" },
  rejected:    { text: "#f87171", border: "#f8717140" },
  unpublished: { text: "#94a3b8", border: "#94a3b840" },
  archived:    { text: "#64748b", border: "#64748b40" },
};

function Badge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.draft;
  return (
    <span style={{ color: c.text, border: `1px solid ${c.border}`, padding: "0.2rem 0.6rem",
      borderRadius: 4, fontSize: "0.78rem", fontWeight: 600, textTransform: "capitalize",
      background: `${c.text}10`, whiteSpace: "nowrap" }}>
      {status?.replace("_", " ")}
    </span>
  );
}

function Btn({ children, onClick, color }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseOver={() => setHov(true)} onMouseOut={() => setHov(false)}
      style={{ padding: "0.28rem 0.6rem", border: `1px solid ${color}80`,
        color: hov ? "#fff" : color, background: hov ? color : `${color}15`,
        borderRadius: 5, fontSize: "0.78rem", cursor: "pointer", transition: "all 0.15s",
        fontWeight: 500, whiteSpace: "nowrap" }}>
      {children}
    </button>
  );
}

const PER_PAGE = 15;

export default function ManageArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [previewId, setPreviewId] = useState(null);
  const [scheduleModal, setScheduleModal] = useState(null); // { id, title }
  const [scheduleAt, setScheduleAt] = useState("");

  const load = () => {
    setLoading(true);
    articleService.list({ status: statusFilter, page, per_page: PER_PAGE })
      .then(d => {
        setArticles(d.articles || []);
        setTotal(d.total || 0);
      })
      .catch(() => toast.error("Failed to load articles"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [statusFilter, page]);

  const act = async (fn, msg) => {
    try { await fn(); toast.success(msg); load(); }
    catch (e) { toast.error(e?.response?.data?.error || "Action failed"); }
  };

  const doReject = async () => {
    if (!rejectReason.trim()) { toast.error("Reason required"); return; }
    await act(() => articleService.reject(rejectId, { reason: rejectReason }), "Article rejected");
    setRejectId(null); setRejectReason("");
  };

  const doSchedule = async () => {
    if (!scheduleAt) { toast.error("Pick a date and time"); return; }
    const dt = new Date(scheduleAt);
    if (isNaN(dt.getTime()) || dt <= new Date()) { toast.error("Must be a future date/time"); return; }
    await act(() => articleService.schedule(scheduleModal.id, dt.toISOString()), "Article scheduled");
    setScheduleModal(null); setScheduleAt("");
  };

  const minDateTime = () => new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16);

  const id = a => a._id || a.id;

  return (
    <div>
      <h2 style={{ color: "#f8fafc", fontSize: "1.5rem", marginBottom: "1.5rem" }}>Manage Articles</h2>

      {/* Status filter tabs */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        {STATUSES.map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            style={{ padding: "0.35rem 0.9rem", borderRadius: 6,
              border: `1px solid ${statusFilter === s ? "#3b82f6" : "rgba(255,255,255,0.1)"}`,
              background: statusFilter === s ? "rgba(59,130,246,0.15)" : "transparent",
              color: statusFilter === s ? "#60a5fa" : "#64748b",
              fontSize: "0.83rem", cursor: "pointer", textTransform: "capitalize" }}>
            {s}
          </button>
        ))}
      </div>

      <div style={{ background: "rgba(15,23,42,0.7)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", color: "#e2e8f0" }}>
          <thead style={{ background: "rgba(0,0,0,0.3)" }}>
            <tr>
              {["Title", "Status", "Author", "Updated", "Actions"].map(h => (
                <th key={h} style={{ padding: "0.85rem 1rem", textAlign: "left",
                  fontSize: "0.78rem", color: "#64748b", fontWeight: 600,
                  textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "#475569" }}>Loading…</td></tr>
            ) : articles.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "#475569" }}>No articles found</td></tr>
            ) : articles.map(a => (
              <tr key={id(a)} style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "0.85rem 1rem", maxWidth: 260 }}>
                  <div style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</div>
                </td>
                <td style={{ padding: "0.85rem 1rem" }}><Badge status={a.status} /></td>
                <td style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontSize: "0.83rem" }}>{a.author_name || "—"}</td>
                <td style={{ padding: "0.85rem 1rem", color: "#64748b", fontSize: "0.78rem" }}>
                  {a.updated_at ? new Date(a.updated_at).toLocaleDateString() : "—"}
                </td>
                <td style={{ padding: "0.85rem 1rem" }}>
                  <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                    <Btn color="#6b7280" onClick={() => setPreviewId(id(a))}>👁 Preview</Btn>
                    {a.status === "submitted" && <>
                      <Btn color="#10b981" onClick={() => act(() => articleService.approve(id(a)), "Approved")}>Approve</Btn>
                      <Btn color="#ef4444" onClick={() => setRejectId(id(a))}>Reject</Btn>
                    </>}
                    {a.status === "approved" && <>
                      <Btn color="#3b82f6" onClick={() => act(() => articleService.publish(id(a)), "Published")}>Publish</Btn>
                      <Btn color="#7c3aed" onClick={() => { setScheduleModal({ id: id(a), title: a.title }); setScheduleAt(""); }}>🕐 Schedule</Btn>
                      <Btn color="#ef4444" onClick={() => setRejectId(id(a))}>Reject</Btn>
                    </>}
                    {a.status === "published" && <>
                      <Btn color="#f59e0b" onClick={() => act(() => articleService.unpublish(id(a)), "Unpublished")}>Unpublish</Btn>
                      <Btn color={a.is_breaking ? "#64748b" : "#ef4444"} onClick={() => act(() => articleService.setBreaking(id(a), !a.is_breaking), a.is_breaking ? "Breaking removed" : "Breaking set")}>{a.is_breaking ? "✓ Breaking" : "Breaking"}</Btn>
                      <Btn color={a.is_featured ? "#64748b" : "#8b5cf6"} onClick={() => act(() => articleService.setFeatured(id(a), !a.is_featured), a.is_featured ? "Unfeatured" : "Featured")}>{a.is_featured ? "✓ Featured" : "Feature"}</Btn>
                    </>}
                    {a.status === "unpublished" &&
                      <Btn color="#3b82f6" onClick={() => act(() => articleService.publish(id(a)), "Re-published")}>Re-publish</Btn>
                    }
                    {a.status === "archived" &&
                      <Btn color="#3b82f6" onClick={() => act(() => articleService.publish(id(a)), "Re-published")}>Re-publish</Btn>
                    }
                    {["draft", "rejected"].includes(a.status) &&
                      <Btn color="#3b82f6" onClick={() => act(() => articleService.submit(id(a)), "Submitted")}>Submit</Btn>
                    }
                    {a.status !== "archived" &&
                      <Btn color="#dc2626" onClick={() => { if (window.confirm("Archive this article?")) act(() => articleService.delete(id(a)), "Archived"); }}>Archive</Btn>
                    }
                  </div>
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

      {/* Reject Modal */}
      {rejectId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "2rem", width: 420, maxWidth: "90vw" }}>
            <h3 style={{ color: "#f8fafc", marginTop: 0 }}>Reject Article</h3>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="Reason for rejection…" rows={4}
              style={{ width: "100%", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)",
                color: "#e2e8f0", borderRadius: 8, padding: "0.75rem", fontSize: "0.9rem", resize: "vertical", boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem", justifyContent: "flex-end" }}>
              <button onClick={() => { setRejectId(null); setRejectReason(""); }}
                style={{ padding: "0.5rem 1.25rem", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "#94a3b8", borderRadius: 6, cursor: "pointer" }}>Cancel</button>
              <button onClick={doReject}
                style={{ padding: "0.5rem 1.25rem", background: "#dc2626", border: "none", color: "#fff", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>Reject</button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {scheduleModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "2rem", width: 440, maxWidth: "90vw" }}>
            <h3 style={{ color: "#f8fafc", marginTop: 0 }}>🕐 Schedule Article</h3>
            <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "1.25rem" }}>"{scheduleModal.title}"</p>
            <label style={{ display: "block", fontSize: "0.85rem", color: "#94a3b8", fontWeight: 500, marginBottom: "0.4rem" }}>
              Publish date &amp; time (your local time)
            </label>
            <input type="datetime-local" value={scheduleAt} min={minDateTime()} onChange={e => setScheduleAt(e.target.value)}
              style={{ width: "100%", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)",
                color: "#e2e8f0", borderRadius: 8, padding: "0.65rem 0.85rem", fontSize: "0.9rem", boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem", justifyContent: "flex-end" }}>
              <button onClick={() => setScheduleModal(null)}
                style={{ padding: "0.5rem 1.25rem", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "#94a3b8", borderRadius: 6, cursor: "pointer" }}>Cancel</button>
              <button onClick={doSchedule}
                style={{ padding: "0.5rem 1.25rem", background: "#7c3aed", border: "none", color: "#fff", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>Confirm Schedule</button>
            </div>
          </div>
        </div>
      )}

      {/* Article Preview Modal */}
      <ArticlePreviewModal articleId={previewId} onClose={() => setPreviewId(null)} />
    </div>
  );
}
