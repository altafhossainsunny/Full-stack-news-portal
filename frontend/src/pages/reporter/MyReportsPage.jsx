import React, { useState, useEffect, useCallback } from "react";
import reportService from "../../services/reportService";
import toast from "react-hot-toast";

const STATUS_STYLES = {
  pending: { bg: "#fef3c720", color: "#d97706" },
  under_review: { bg: "#dbeafe20", color: "#2563eb" },
  published: { bg: "#d1fae520", color: "#059669" },
  rejected: { bg: "#fee2e220", color: "#dc2626" },
};

export default function MyReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);
  const PER_PAGE = 20;

  const fetch = useCallback(() => {
    setLoading(true);
    reportService.myReports({ page, per_page: PER_PAGE })
      .then(d => { setReports(d.reports || []); setTotal(d.total || 0); })
      .catch(() => toast.error("Failed to load reports"))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { fetch(); }, [fetch]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>My Reports ({total})</h2>

      {loading ? <p style={{ color: "#6b7280" }}>Loading…</p> : (
        <>
          {reports.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 10, padding: "3rem", textAlign: "center", color: "#9ca3af" }}>
              No reports submitted yet
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem" }}>
              {reports.map(r => {
                const st = STATUS_STYLES[r.status] || STATUS_STYLES.pending;
                return (
                  <div key={r._id} style={{ background: "#fff", borderRadius: 10, padding: "1.25rem 1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", cursor: "pointer" }}
                    onClick={() => setSelected(r)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem" }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: "0 0 0.35rem", fontSize: "1rem" }}>{r.title}</h3>
                        <p style={{ margin: "0 0 0.25rem", color: "#6b7280", fontSize: "0.83rem" }}>
                          Language: {r.language} · Location: {r.location || "—"}
                        </p>
                        <p style={{ margin: 0, color: "#9ca3af", fontSize: "0.78rem" }}>
                          Submitted {r.created_at ? new Date(r.created_at).toLocaleString() : "—"}
                        </p>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.35rem" }}>
                        <span style={{ background: st.bg, color: st.color, padding: "0.2rem 0.65rem", borderRadius: 4, fontSize: "0.8rem", fontWeight: 600 }}>
                          {r.status?.replace("_", " ")}
                        </span>
                        {r.media_files?.length > 0 && (
                          <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>📎 {r.media_files.length} file(s)</span>
                        )}
                      </div>
                    </div>
                    {r.rejection_reason && (
                      <p style={{ margin: "0.75rem 0 0", padding: "0.5rem 0.75rem", background: "#fee2e2", borderRadius: 6, fontSize: "0.83rem", color: "#dc2626" }}>
                        <strong>Rejection reason:</strong> {r.rejection_reason}
                      </p>
                    )}
                  </div>
                );
              })}
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

      {/* Detail Modal */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "1rem" }}
          onClick={() => setSelected(null)}>
          <div style={{ background: "#fff", padding: "2rem", borderRadius: 12, width: "100%", maxWidth: 620, maxHeight: "80vh", overflowY: "auto" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0, flex: 1, fontSize: "1.1rem" }}>{selected.title}</h3>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.4rem", color: "#6b7280", lineHeight: 1 }}>×</button>
            </div>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.83rem", color: "#6b7280" }}>📍 {selected.location || "Unknown"}</span>
              <span style={{ fontSize: "0.83rem", color: "#6b7280" }}>🗓 {selected.incident_date || "—"}</span>
              <span style={{ fontSize: "0.83rem", color: "#6b7280" }}>🌐 {selected.language}</span>
            </div>
            <div style={{ background: "#f9fafb", padding: "1rem", borderRadius: 8, marginBottom: "1rem" }}>
              <p style={{ margin: 0, fontSize: "0.9rem", whiteSpace: "pre-wrap" }}>{selected.content}</p>
            </div>
            {selected.media_files?.length > 0 && (
              <div>
                <p style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem" }}>Attached Media:</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {selected.media_files.map((f, i) => (
                    <a key={i} href={f.url} target="_blank" rel="noreferrer"
                      style={{ padding: "0.3rem 0.7rem", background: "#f3f4f6", borderRadius: 4, fontSize: "0.8rem", textDecoration: "none", color: "#1a1a2e" }}>
                      {f.original_name || `File ${i + 1}`}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
