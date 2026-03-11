import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import dashboardService from "../../services/dashboardService";
import toast from "react-hot-toast";

// Helper components for premium UI
function StatCard({ label, value, color, icon, trend }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      style={{
        background: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(10px)",
        borderRadius: 16, 
        padding: "1.5rem",
        border: "1px solid rgba(255,255,255,0.05)",
        boxShadow: isHovered ? "0 10px 25px rgba(0,0,0,0.5)" : "0 4px 6px rgba(0,0,0,0.3)",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
        flex: "1 1 200px"
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{
        position: "absolute",
        top: 0, right: 0,
        padding: "1rem",
        fontSize: "2rem",
        opacity: isHovered ? 0.3 : 0.1,
        transition: "opacity 0.3s"
      }}>
        {icon}
      </div>
      
      <div style={{ 
        width: 48, height: 48, 
        borderRadius: 12, 
        background: `linear-gradient(135deg, ${color}20, ${color}50)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: color,
        fontSize: "1.5rem",
        marginBottom: "1rem",
        border: `1px solid ${color}40`
      }}>
        {icon}
      </div>
      
      <p style={{ color: "#94a3b8", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 0.5rem" }}>{label}</p>
      
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem" }}>
        <p style={{ fontSize: "2.25rem", fontWeight: 800, margin: 0, color: "#f8fafc", letterSpacing: "-1px" }}>{value ?? "–"}</p>
        {trend && (
          <span style={{ 
            fontSize: "0.75rem", 
            fontWeight: 700, 
            color: trend > 0 ? "#10b981" : "#ef4444",
            background: trend > 0 ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
            padding: "0.2rem 0.5rem",
            borderRadius: 4
          }}>
            {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
        )}
      </div>
      
      {/* Decorative gradient strip at bottom */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 4,
        background: `linear-gradient(90deg, ${color}, transparent)`
      }} />
    </div>
  );
}

function ActionCard({ to, title, description, icon }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Link 
      to={to} 
      style={{
        display: "flex", alignItems: "flex-start", gap: "1rem",
        padding: "1.25rem",
        background: isHovered ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: 12,
        textDecoration: "none",
        transition: "all 0.2s"
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ 
        width: 40, height: 40, borderRadius: 10, 
        background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1.2rem", flexShrink: 0
      }}>
        {icon}
      </div>
      <div>
        <h4 style={{ color: "#f8fafc", margin: "0 0 0.25rem", fontSize: "1rem" }}>{title}</h4>
        <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.85rem", lineHeight: 1.4 }}>{description}</p>
      </div>
    </Link>
  );
}

export default function OwnerDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch real stats from backend; silently show empty on failure (mock mode)
  useEffect(() => {
    dashboardService.ownerStats()
      .then(d => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      <style>
        {`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          
          /* Mock scrollbar for dark mode */
          ::-webkit-scrollbar { width: 8px; height: 8px; }
          ::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
          ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
          ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        `}
      </style>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#f8fafc", margin: "0 0 0.5rem", letterSpacing: "-0.5px" }}>
            Overview
          </h2>
          <p style={{ color: "#94a3b8", margin: 0 }}>Welcome back, here's what's happening today.</p>
        </div>
        <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: "3rem" }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ 
              background: "rgba(255,255,255,0.02)", height: 160, borderRadius: 16, 
              flex: "1 1 200px", animation: "pulse 1.5s infinite" 
            }}>
              <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
          <StatCard label="Total Users" value={stats?.total_users} icon="👥" color="#3b82f6" trend={12.5} />
          <StatCard label="Published Articles" value={stats?.published_articles} icon="📰" color="#10b981" trend={5.2} />
          <StatCard label="Pending Review" value={stats?.pending_articles} icon="⏳" color="#f59e0b" trend={-2.4} />
          <StatCard label="Reporter Submissions" value={stats?.reporter_submissions} icon="🎤" color="#ec4899" trend={18.1} />
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "2rem" }}>
        {/* Left Column: Tables */}
        <div>
          <h3 style={{ fontSize: "1.25rem", color: "#f8fafc", marginBottom: "1rem" }}>Recent Submissions</h3>
          <div style={{ 
            background: "rgba(15, 23, 42, 0.6)", 
            border: "1px solid rgba(255,255,255,0.05)", 
            borderRadius: 16,
            overflow: "hidden"
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead style={{ background: "rgba(0,0,0,0.2)", color: "#94a3b8", fontSize: "0.85rem", textTransform: "uppercase" }}>
                <tr>
                  <th style={{ padding: "1rem 1.5rem", fontWeight: 600 }}>Title</th>
                  <th style={{ padding: "1rem 1.5rem", fontWeight: 600 }}>Author</th>
                  <th style={{ padding: "1rem 1.5rem", fontWeight: 600 }}>Status</th>
                  <th style={{ padding: "1rem 1.5rem", fontWeight: 600 }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { title: "Economic Policy Updates for Q4", author: "Hasan Tariq", status: "Under Review", time: "10 min ago" },
                  { title: "Climate Summit Resolutions Detailed", author: "Aisha Rahman", status: "AI Translating", time: "1 hour ago" },
                  { title: "Cricket Team Announcements", author: "Kamal Uddin", status: "Pending", time: "2 hours ago" },
                  { title: "Tech Sector Expansion in Dhaka", author: "Nadia Islam", status: "Approved", time: "5 hours ago" },
                ].map((row, idx) => (
                  <tr key={idx} style={{ 
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                    transition: "background 0.2s"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                  onMouseOut={(e) => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "1rem 1.5rem", color: "#e2e8f0", fontWeight: 500 }}>{row.title}</td>
                    <td style={{ padding: "1rem 1.5rem", color: "#94a3b8", fontSize: "0.9rem" }}>{row.author}</td>
                    <td style={{ padding: "1rem 1.5rem" }}>
                      <span style={{ 
                        background: row.status === "Approved" ? "rgba(16, 185, 129, 0.1)" : 
                                    row.status === "Pending" ? "rgba(245, 158, 11, 0.1)" : "rgba(59, 130, 246, 0.1)",
                        color: row.status === "Approved" ? "#34d399" : 
                               row.status === "Pending" ? "#fbbf24" : "#60a5fa",
                        padding: "0.25rem 0.75rem", borderRadius: 999, fontSize: "0.75rem", fontWeight: 600
                      }}>
                        {row.status}
                      </span>
                    </td>
                    <td style={{ padding: "1rem 1.5rem", color: "#64748b", fontSize: "0.85rem" }}>{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
              <Link to="/publisher/review" style={{ color: "#3b82f6", textDecoration: "none", fontSize: "0.9rem", fontWeight: 600 }}>
                View Full Review Queue →
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Actions */}
        <div>
          <h3 style={{ fontSize: "1.25rem", color: "#f8fafc", marginBottom: "1rem" }}>Quick Actions</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <ActionCard 
              to="/owner/invite" 
              title="Invite Team Member" 
              description="Add a new reporter, editor, or publisher." 
              icon="📧"
            />
            <ActionCard 
              to="/owner/categories" 
              title="Manage Categories" 
              description="Update site navigation and topics." 
              icon="🗂️"
            />
            <ActionCard 
              to="/owner/corners" 
              title="Configure Corners" 
              description="Setup special coverage areas." 
              icon="✒️"
            />
            <ActionCard 
              to="/owner/ads" 
              title="Advertisement Control" 
              description="Deploy and manage site banners." 
              icon="💸"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
