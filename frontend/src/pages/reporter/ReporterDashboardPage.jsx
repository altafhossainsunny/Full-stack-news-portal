import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import dashboardService from "../../services/dashboardService";
import toast from "react-hot-toast";

function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 10, padding: "1.5rem",
      boxShadow: "0 2px 8px rgba(0,0,0,0.07)", flex: "1 1 160px",
      borderLeft: `4px solid ${color || "#ea580c"}`,
    }}>
      <p style={{ color: "#6b7280", fontSize: "0.85rem", margin: 0 }}>{label}</p>
      <p style={{ fontSize: "2rem", fontWeight: 700, margin: "0.25rem 0 0", color: "#1a1a2e" }}>{value ?? "–"}</p>
    </div>
  );
}

export default function ReporterDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.reporterStats()
      .then(d => setStats(d))
      .catch(() => toast.error("Failed to load stats"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 style={{ marginBottom: "1.5rem", fontSize: "1.5rem" }}>Reporter Dashboard</h2>

      {loading ? <p style={{ color: "#6b7280" }}>Loading stats…</p> : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
          <StatCard label="Total Submissions" value={stats?.total_reports} color="#ea580c" />
          <StatCard label="Pending" value={stats?.pending} color="#d97706" />
          <StatCard label="Reviewed" value={stats?.reviewed} color="#0891b2" />
          <StatCard label="Published" value={stats?.published} color="#16a34a" />
          <StatCard label="Rejected" value={stats?.rejected} color="#dc2626" />
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {[
          { to: "/reporter/submit", label: "📝 Submit Report", primary: true },
          { to: "/reporter/reports", label: "My Reports" },
        ].map(link => (
          <Link key={link.to} to={link.to}
            style={{
              padding: "0.75rem 1.5rem",
              background: link.primary ? "#ea580c" : "#1a1a2e",
              color: "#fff", borderRadius: 6, textDecoration: "none", fontSize: "0.9rem",
            }}>
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
