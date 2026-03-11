import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (!email || !password) {
      setErrorMsg("Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      console.log("[Login] Attempting login for:", email);
      const user = await login(email, password);
      console.log("[Login] Success, user:", user);
      toast.success("Welcome back!");
      const dashboardMap = {
        owner: "/owner",
        publisher: "/publisher",
        editor: "/editor",
        reporter: "/reporter",
      };
      const dest = dashboardMap[user?.role] || "/";
      console.log("[Login] Navigating to:", dest);
      navigate(dest);
    } catch (err) {
      console.error("[Login] Error:", err, err?.response?.data);
      const msg = err?.response?.data?.error || err?.message || "Login failed. Check console for details.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#f9fafb",
    }}>
      <div style={{
        background: "#fff", padding: "2.5rem", borderRadius: 12,
        boxShadow: "0 4px 16px rgba(0,0,0,0.1)", width: "100%", maxWidth: 420,
      }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.5rem", color: "#1a1a2e" }}>Newsroom Login</h1>
          <p style={{ color: "#6b7280", fontSize: "0.9rem", marginTop: "0.5rem" }}>Bangladesh Global Newspaper</p>
        </div>

        <form onSubmit={handleSubmit}>
          {errorMsg && (
            <div style={{
              background: "#fef2f2", border: "1px solid #fca5a5",
              color: "#dc2626", padding: "0.75rem", borderRadius: 6,
              marginBottom: "1rem", fontSize: "0.9rem",
            }}>
              {errorMsg}
            </div>
          )}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.4rem" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                width: "100%", padding: "0.65rem 0.85rem",
                border: "1px solid #d1d5db", borderRadius: 6, fontSize: "0.95rem",
              }}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.4rem" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Your password"
              required
              style={{
                width: "100%", padding: "0.65rem 0.85rem",
                border: "1px solid #d1d5db", borderRadius: 6, fontSize: "0.95rem",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "0.75rem",
              background: loading ? "#9ca3af" : "#1a1a2e",
              color: "#fff", border: "none", borderRadius: 6,
              fontSize: "1rem", fontWeight: 500,
            }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <Link to="/" style={{ color: "#6b7280", fontSize: "0.85rem" }}>← Back to public site</Link>
        </div>
      </div>
    </div>
  );
}
