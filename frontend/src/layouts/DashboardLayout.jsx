import React, { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navLinks = {
  owner: [
    { to: "/owner", label: "Dashboard", icon: "📊" },
    { to: "/owner/users", label: "Users", icon: "👥" },
    { to: "/owner/invite", label: "Invite", icon: "✉️" },
    { to: "/owner/categories", label: "Categories", icon: "📑" },
    { to: "/owner/corners", label: "Corners", icon: "🗂️" },
    { to: "/owner/ads", label: "Ads", icon: "🏷️" },
    { to: "/owner/activity-logs", label: "Logs", icon: "📝" },
    { to: "/owner/articles/create", label: "Write Article", icon: "✍️" },
    { to: "/owner/articles", label: "Articles", icon: "📰" },
    { to: "/owner/live", label: "Live Coverage", icon: "📡" },
    { to: "/owner/homepage", label: "Homepage", icon: "🏠" },
  ],
  publisher: [
    { to: "/publisher", label: "Dashboard", icon: "📊" },
    { to: "/publisher/articles/create", label: "Write Article", icon: "✍️" },
    { to: "/publisher/review", label: "Review Queue", icon: "🔍" },
    { to: "/publisher/published", label: "Published", icon: "🗞️" },
    { to: "/publisher/breaking", label: "Breaking News", icon: "🔴" },
    { to: "/publisher/featured", label: "Featured Stories", icon: "⭐" },
    { to: "/publisher/scheduled", label: "Scheduled", icon: "🗓️" },
    { to: "/publisher/live", label: "Live Coverage", icon: "📡" },
  ],
  editor: [
    { to: "/editor", label: "Dashboard", icon: "📊" },
    { to: "/editor/articles/create", label: "New Article", icon: "✍️" },
    { to: "/editor/articles", label: "My Articles", icon: "📄" },
    { to: "/editor/media", label: "Media Library", icon: "🖼️" },
  ],
  reporter: [
    { to: "/reporter", label: "Dashboard", icon: "📊" },
    { to: "/reporter/submit", label: "Submit Report", icon: "📝" },
    { to: "/reporter/reports", label: "My Reports", icon: "📋" },
  ],
};

export default function DashboardLayout({ role }) {
  const { user, logout } = useAuth();
  const unreadCount = 0;
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Default to owner links for preview
  const links = navLinks[role] || navLinks["owner"];

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0f172a", fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 260 : 80,
        background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
        color: "#f8fafc",
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid rgba(255,255,255,0.05)",
        boxShadow: "4px 0 24px rgba(0,0,0,0.2)"
      }}>
        <div style={{ 
          padding: "1.5rem", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: sidebarOpen ? "flex-start" : "center",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          height: "72px"
        }}>
          {sidebarOpen ? (
            <Link to="/" style={{ color: "#fff", fontWeight: 800, fontSize: "1.2rem", textDecoration: "none", letterSpacing: "-0.5px" }}>
              <span style={{ color: "#3b82f6" }}>BGN</span> Newsroom
            </Link>
          ) : (
            <Link to="/" style={{ color: "#3b82f6", fontWeight: 800, fontSize: "1.5rem", textDecoration: "none" }}>
              B
            </Link>
          )}
        </div>
        
        <nav style={{ flex: 1, padding: "1.5rem 0.75rem", overflowY: "auto" }}>
          <p style={{ 
            fontSize: "0.75rem", 
            textTransform: "uppercase", 
            letterSpacing: "1px", 
            color: "#64748b",
            margin: "0 0.75rem 1rem",
            display: sidebarOpen ? "block" : "none"
          }}>
            Main Menu
          </p>
          {links.map(link => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "0.75rem 1rem",
                  margin: "0.25rem 0",
                  color: isActive ? "#ffffff" : "#94a3b8",
                  background: isActive ? "rgba(59, 130, 246, 0.15)" : "transparent",
                  borderLeft: isActive ? "3px solid #3b82f6" : "3px solid transparent",
                  borderRadius: "0 8px 8px 0",
                  fontSize: "0.95rem",
                  fontWeight: isActive ? 600 : 400,
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                  justifyContent: sidebarOpen ? "flex-start" : "center"
                }}
                onMouseOver={(e) => {
                  if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }}
                onMouseOut={(e) => {
                  if (!isActive) e.currentTarget.style.background = "transparent";
                }}
              >
                <span style={{ fontSize: "1.2rem", marginRight: sidebarOpen ? "1rem" : "0" }}>{link.icon}</span>
                {sidebarOpen && <span>{link.label}</span>}
              </Link>
            );
          })}
        </nav>
        
        <div style={{ padding: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.2)" }}>
          {sidebarOpen && user && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                {user.name[0]}
              </div>
              <div>
                <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#f8fafc" }}>{user.name}</div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "capitalize" }}>{user.role}</div>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              color: "#f87171",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              borderRadius: 8,
              padding: "0.6rem",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: 600,
              width: "100%",
              transition: "all 0.2s ease"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#ef4444";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
              e.currentTarget.style.color = "#f87171";
            }}
          >
            {sidebarOpen ? "Sign Out" : "🚪"}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Glassmorphic Topbar */}
        <header style={{
          background: "rgba(15, 23, 42, 0.7)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          padding: "0 2rem",
          height: "72px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 10
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              onClick={() => setSidebarOpen(o => !o)}
              style={{ 
                background: "rgba(255,255,255,0.05)", 
                border: "1px solid rgba(255,255,255,0.1)", 
                color: "#e2e8f0",
                width: 36, height: 36, borderRadius: 8, 
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "all 0.2s"
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
              onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
            >
              ☰
            </button>
            <h1 style={{ color: "#f8fafc", fontSize: "1.1rem", fontWeight: 600, margin: 0 }}>
              {links.find(l => l.to === location.pathname)?.label || "Dashboard"}
            </h1>
          </div>
          
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
            <Link to="/" style={{ 
              fontSize: "0.85rem", color: "#94a3b8", textDecoration: "none",
              display: "flex", alignItems: "center", gap: "0.5rem"
            }}>
              <span>🌐</span> View Live Site
            </Link>
            
            <div style={{ position: "relative", cursor: "pointer" }}>
              <span style={{ fontSize: "1.2rem" }}>🔔</span>
              {unreadCount > 0 && (
                <span style={{
                  position: "absolute", top: -5, right: -5,
                  background: "#ef4444", color: "#fff",
                  borderRadius: "50%", width: 18, height: 18,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.65rem", fontWeight: "bold",
                  border: "2px solid #0f172a"
                }}>
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main style={{ 
          flex: 1, 
          padding: "2rem", 
          overflowY: "auto",
          background: "radial-gradient(circle at top right, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 1) 100%)"
        }}>
          <div style={{ maxWidth: 1400, margin: "0 auto" }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
