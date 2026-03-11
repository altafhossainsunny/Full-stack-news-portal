import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import dashboardService from "../../services/dashboardService";
import toast from "react-hot-toast";

function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 10, padding: "1.5rem",
      boxShadow: "0 2px 8px rgba(0,0,0,0.07)", flex: "1 1 160px",
      borderLeft: `4px solid ${color || "#16a34a"}`,
    }}>
      <p style={{ color: "#6b7280", fontSize: "0.85rem", margin: 0 }}>{label}</p>
      <p style={{ fontSize: "2rem", fontWeight: 700, margin: "0.25rem 0 0", color: "#1a1a2e" }}>{value ?? "–"}</p>
    </div>
  );
}

export default function EditorDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.editorStats()
      .then(d => setStats(d))
      .catch(() => toast.error("Failed to load stats"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 style={{ marginBottom: "1.5rem", fontSize: "1.5rem" }}>Editor Dashboard</h2>

      {loading ? <p style={{ color: "#6b7280" }}>Loading stats…</p> : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
          <StatCard label="My Drafts" value={stats?.drafts} color="#6b7280" />
          <StatCard label="Submitted" value={stats?.submitted} color="#ea580c" />
          <StatCard label="Approved" value={stats?.approved} color="#16a34a" />
          <StatCard label="Rejected/Returned" value={stats?.rejected} color="#dc2626" />
          <StatCard label="Published" value={stats?.published} color="#0891b2" />
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {[
          { to: "/editor/articles/create", label: "✏ Write New Article", primary: true },
          { to: "/editor/articles", label: "My Articles" },
          { to: "/editor/media", label: "Media Library" },
        ].map(link => (
          <Link key={link.to} to={link.to}
            style={{
              padding: "0.75rem 1.5rem",
              background: link.primary ? "#16a34a" : "#1a1a2e",
              color: "#fff", borderRadius: 6, textDecoration: "none", fontSize: "0.9rem",
            }}>
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
