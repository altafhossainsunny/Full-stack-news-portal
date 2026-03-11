import React, { useEffect, useState, useCallback } from "react";
import dashboardService from "../../services/dashboardService";
import toast from "react-hot-toast";

const ACTION_COLORS = { create: "#16a34a", update: "#0891b2", delete: "#dc2626", publish: "#7c3aed", login: "#ea580c" };

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PER_PAGE = 30;

  const fetchLogs = useCallback(() => {
    setLoading(true);
    dashboardService.activityLogs({ page, per_page: PER_PAGE })
      .then(d => { const list = Array.isArray(d) ? d : []; setLogs(list); setTotal(list.length); })
      .catch(() => toast.error("Failed to load logs"))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>Activity Logs</h2>

      {loading ? <p style={{ color: "#6b7280" }}>Loading…</p> : (
        <>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", marginBottom: "1rem" }}>
              <thead>
                <tr style={{ background: "#f3f4f6" }}>
                  {["Time", "User", "Action", "Target", "Details"].map(h => (
                    <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.85rem", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#9ca3af" }}>No logs found</td></tr>
                ) : logs.map(log => (
                  <tr key={log.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "#6b7280", whiteSpace: "nowrap" }}>
                      {log.created_at ? new Date(log.created_at).toLocaleString() : "—"}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem" }}>{log.user_name || log.user_email || "—"}</td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <span style={{
                        background: (ACTION_COLORS[log.action] || "#374151") + "20",
                        color: ACTION_COLORS[log.action] || "#374151",
                        padding: "0.2rem 0.55rem", borderRadius: 4, fontSize: "0.78rem", fontWeight: 600,
                      }}>{log.action}</span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", color: "#6b7280" }}>{log.target_type || "—"}</td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.82rem", color: "#6b7280", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {log.details || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ padding: "0.4rem 0.85rem", border: "1px solid #d1d5db", borderRadius: 4, cursor: page === 1 ? "default" : "pointer", background: "#fff" }}>
                Prev
              </button>
              <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                style={{ padding: "0.4rem 0.85rem", border: "1px solid #d1d5db", borderRadius: 4, cursor: page === totalPages ? "default" : "pointer", background: "#fff" }}>
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
