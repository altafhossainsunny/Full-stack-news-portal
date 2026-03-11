import React, { useState, useEffect, useCallback } from "react";
import articleService from "../../services/articleService";
import ArticlePreviewModal from "../../components/cms/ArticlePreviewModal";
import toast from "react-hot-toast";

export default function ReviewArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const [previewId, setPreviewId] = useState(null);
  const [rejectModal, setRejectModal] = useState(null); // { id, title }
  const [rejectReason, setRejectReason] = useState("");
  const [returnModal, setReturnModal] = useState(null);
  const [returnNote, setReturnNote] = useState("");
  const [scheduleModal, setScheduleModal] = useState(null); // { id, title }
  const [scheduleAt, setScheduleAt] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PER_PAGE = 20;

  // Auto-publish any scheduled articles whose time has arrived
  useEffect(() => { articleService.processScheduled().catch(() => {}); }, []);

  const fetchQueue = useCallback(() => {
    setLoading(true);
    articleService.listByStatus("submitted", { page, per_page: PER_PAGE })
      .then(d => { setArticles(d.articles || []); setTotal(d.total || 0); })
      .catch(() => toast.error("Failed to load review queue"))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { fetchQueue(); }, [fetchQueue]);

  const approve = async (id) => {
    setActioningId(id);
    try {
      await articleService.approve(id);
      await articleService.publish(id);
      toast.success("Article approved & published!");
      fetchQueue();
    } catch (err) { toast.error(err?.response?.data?.error || err?.message || "Failed to approve"); }
    finally { setActioningId(null); }
  };

  const reject = async () => {
    if (!rejectReason.trim()) { toast.error("Please enter a reason"); return; }
    setActioningId(rejectModal.id);
    try {
      await articleService.reject(rejectModal.id, { reason: rejectReason });
      toast.success("Article rejected");
      setRejectModal(null); setRejectReason("");
      fetchQueue();
    } catch (err) { toast.error(err?.response?.data?.error || err?.message || "Failed to reject"); }
    finally { setActioningId(null); }
  };

  const returnToEditor = async () => {
    if (!returnNote.trim()) { toast.error("Please enter a return note"); return; }
    setActioningId(returnModal.id);
    try {
      await articleService.returnToEditor(returnModal.id, { reason: returnNote });
      toast.success("Article returned to editor");
      setReturnModal(null); setReturnNote("");
      fetchQueue();
    } catch (err) { toast.error(err?.response?.data?.error || err?.message || "Failed to return"); }
    finally { setActioningId(null); }
  };

  const scheduleArticle = async () => {
    if (!scheduleAt) { toast.error("Please pick a date and time"); return; }
    const dt = new Date(scheduleAt);
    if (isNaN(dt.getTime()) || dt <= new Date()) {
      toast.error("Scheduled time must be in the future");
      return;
    }
    setActioningId(scheduleModal.id);
    try {
      await articleService.schedule(scheduleModal.id, dt.toISOString());
      toast.success("Article scheduled!");
      setScheduleModal(null); setScheduleAt("");
      fetchQueue();
    } catch (err) { toast.error(err?.response?.data?.error || err?.message || "Failed to schedule"); }
    finally { setActioningId(null); }
  };

  const minDateTime = () => {
    const d = new Date(Date.now() + 5 * 60 * 1000);
    return d.toISOString().slice(0, 16);
  };

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>
        Review Queue
        {total > 0 && <span style={{ marginLeft: "0.75rem", fontSize: "1rem", color: "#ea580c", fontWeight: 400 }}>({total} pending)</span>}
      </h2>

      {loading ? <p style={{ color: "#6b7280" }}>Loading…</p> : articles.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 10, padding: "3rem", textAlign: "center", color: "#9ca3af" }}>
          No articles pending review
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1rem" }}>
            {articles.map(art => (
              <div key={art.id} style={{ background: "#fff", borderRadius: 10, padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem" }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: "0 0 0.35rem", fontSize: "1.05rem" }}>{art.title}</h3>
                    <p style={{ margin: "0 0 0.35rem", color: "#6b7280", fontSize: "0.85rem" }}>
                      By {art.author_name || "Unknown"} · {art.category_name || "Uncategorized"}
                      {art.corner_name ? ` · ${art.corner_name}` : ""}
                    </p>
                    <p style={{ margin: 0, color: "#9ca3af", fontSize: "0.8rem" }}>
                      Submitted {art.submitted_at ? new Date(art.submitted_at).toLocaleString() : "—"}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                    <button
                      onClick={() => setPreviewId(art.id)}
                      style={{ padding: "0.4rem 0.9rem", background: "transparent", color: "#6b7280", border: "1px solid #d1d5db", borderRadius: 4, cursor: "pointer", fontSize: "0.83rem" }}>
                      👁 Preview
                    </button>
                    <button
                      onClick={() => approve(art.id)}
                      disabled={actioningId === art.id}
                      style={{ padding: "0.4rem 0.9rem", background: "#16a34a", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: "0.85rem" }}>
                      {actioningId === art.id ? "Publishing…" : "Approve & Publish"}
                    </button>
                    <button
                      onClick={() => { setScheduleModal({ id: art.id, title: art.title }); setScheduleAt(""); }}
                      disabled={actioningId === art.id}
                      style={{ padding: "0.4rem 0.9rem", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: "0.83rem" }}>
                      🕐 Schedule
                    </button>
                    <button
                      onClick={() => { setReturnModal({ id: art.id, title: art.title }); setReturnNote(""); }}
                      disabled={actioningId === art.id}
                      style={{ padding: "0.4rem 0.9rem", background: "#ea580c", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: "0.85rem" }}>
                      Return
                    </button>
                    <button
                      onClick={() => { setRejectModal({ id: art.id, title: art.title }); setRejectReason(""); }}
                      disabled={actioningId === art.id}
                      style={{ padding: "0.4rem 0.9rem", background: "#dc2626", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: "0.85rem" }}>
                      Reject
                    </button>
                  </div>
                </div>
                {art.summary && (
                  <p style={{ marginTop: "0.75rem", marginBottom: 0, fontSize: "0.88rem", color: "#374151", borderTop: "1px solid #f3f4f6", paddingTop: "0.75rem" }}>
                    {art.summary.length > 200 ? art.summary.slice(0, 200) + "…" : art.summary}
                  </p>
                )}
              </div>
            ))}
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

      {/* Article Preview Modal */}
      <ArticlePreviewModal articleId={previewId} onClose={() => setPreviewId(null)} />

      {/* Schedule Modal */}
      {scheduleModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div style={{ background: "#fff", padding: "2rem", borderRadius: 10, width: "100%", maxWidth: 440 }}>
            <h3 style={{ marginTop: 0 }}>🕐 Schedule Article</h3>
            <p style={{ fontSize: "0.9rem", color: "#374151", marginBottom: "1.25rem" }}>"{scheduleModal.title}"</p>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.4rem" }}>
              Publish date &amp; time (your local time)
            </label>
            <input
              type="datetime-local"
              value={scheduleAt}
              min={minDateTime()}
              onChange={e => setScheduleAt(e.target.value)}
              style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid #d1d5db", borderRadius: 6, fontSize: "0.9rem", boxSizing: "border-box" }}
            />
            <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: "0.4rem", marginBottom: 0 }}>
              The article will appear in Scheduled Articles and auto-publish at this time.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1.25rem" }}>
              <button onClick={() => setScheduleModal(null)}
                style={{ padding: "0.5rem 1rem", border: "1px solid #d1d5db", background: "#fff", borderRadius: 6, cursor: "pointer" }}>Cancel</button>
              <button onClick={scheduleArticle} disabled={!!actioningId}
                style={{ padding: "0.5rem 1.25rem", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
                {actioningId ? "Scheduling…" : "Confirm Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div style={{ background: "#fff", padding: "2rem", borderRadius: 10, width: "100%", maxWidth: 480 }}>
            <h3 style={{ marginTop: 0 }}>Reject Article</h3>
            <p style={{ fontSize: "0.9rem", color: "#374151" }}>"{rejectModal.title}"</p>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.4rem" }}>Reason for Rejection</label>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={4} placeholder="Explain why this article is rejected…"
              style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid #d1d5db", borderRadius: 6, resize: "vertical" }} />
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1.25rem" }}>
              <button onClick={() => setRejectModal(null)}
                style={{ padding: "0.5rem 1rem", border: "1px solid #d1d5db", background: "#fff", borderRadius: 6, cursor: "pointer" }}>Cancel</button>
              <button onClick={reject} disabled={actioningId}
                style={{ padding: "0.5rem 1rem", background: "#dc2626", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
                {actioningId ? "Rejecting…" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {returnModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div style={{ background: "#fff", padding: "2rem", borderRadius: 10, width: "100%", maxWidth: 480 }}>
            <h3 style={{ marginTop: 0 }}>Return to Editor</h3>
            <p style={{ fontSize: "0.9rem", color: "#374151" }}>"{returnModal.title}"</p>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.4rem" }}>Notes for Editor</label>
            <textarea value={returnNote} onChange={e => setReturnNote(e.target.value)} rows={4} placeholder="What should the editor fix or improve?"
              style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid #d1d5db", borderRadius: 6, resize: "vertical" }} />
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1.25rem" }}>
              <button onClick={() => setReturnModal(null)}
                style={{ padding: "0.5rem 1rem", border: "1px solid #d1d5db", background: "#fff", borderRadius: 6, cursor: "pointer" }}>Cancel</button>
              <button onClick={returnToEditor} disabled={actioningId}
                style={{ padding: "0.5rem 1rem", background: "#ea580c", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
                {actioningId ? "Returning…" : "Return"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
