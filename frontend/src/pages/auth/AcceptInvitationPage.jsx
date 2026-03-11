import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import invitationService from "../../services/invitationService";
import toast from "react-hot-toast";

export default function AcceptInvitationPage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [invitation, setInvitation] = useState(null);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    if (!token) { setInvalid(true); setVerifying(false); return; }
    invitationService.verify(token)
      .then(data => { setInvitation(data); setVerifying(false); })
      .catch(() => { setInvalid(true); setVerifying(false); });
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Name is required"); return; }
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (password !== confirm) { toast.error("Passwords do not match"); return; }
    setLoading(true);
    try {
      await invitationService.accept({ token, name, password });
      toast.success("Account created! Please log in.");
      navigate("/auth/login");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Verifying invitation…</p>
      </div>
    );
  }

  if (invalid) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem" }}>
        <h2 style={{ color: "#dc2626" }}>Invalid or Expired Invitation</h2>
        <p style={{ color: "#6b7280" }}>This invitation link is invalid or has already been used.</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#f9fafb",
    }}>
      <div style={{
        background: "#fff", padding: "2.5rem", borderRadius: 12,
        boxShadow: "0 4px 16px rgba(0,0,0,0.1)", width: "100%", maxWidth: 460,
      }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.5rem", color: "#1a1a2e" }}>Create Your Account</h1>
          <p style={{ color: "#6b7280", fontSize: "0.9rem", marginTop: "0.5rem" }}>
            Joining as <strong>{invitation?.role}</strong>
          </p>
          <p style={{ color: "#374151", fontSize: "0.9rem" }}>
            {invitation?.email}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.4rem" }}>
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your full name"
              required
              style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid #d1d5db", borderRadius: 6 }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.4rem" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid #d1d5db", borderRadius: 6 }}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.4rem" }}>
              Confirm Password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Re-enter password"
              required
              style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid #d1d5db", borderRadius: 6 }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "0.75rem",
              background: loading ? "#9ca3af" : "#1a1a2e",
              color: "#fff", border: "none", borderRadius: 6, fontSize: "1rem", fontWeight: 500,
            }}
          >
            {loading ? "Creating Account…" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
