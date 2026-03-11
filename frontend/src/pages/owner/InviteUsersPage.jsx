import React, { useState, useEffect } from "react";
import invitationService from "../../services/invitationService";
import toast from "react-hot-toast";

const ROLES = ["publisher", "editor", "reporter"];

export default function InviteUsersPage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [sending, setSending] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  const fetchInvitations = () => {
    setLoadingList(true);
    invitationService.list()
      .then(d => setInvitations(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoadingList(false));
  };

  useEffect(() => { fetchInvitations(); }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!email || !role) return;
    setSending(true);
    try {
      await invitationService.send({ email, role });
      toast.success(`Invitation sent to ${email}`);
      setEmail("");
      fetchInvitations();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send invitation");
    } finally {
      setSending(false);
    }
  };

  const revoke = async (id) => {
    if (!window.confirm("Revoke this invitation?")) return;
    try {
      await invitationService.revoke(id);
      toast.success("Invitation revoked");
      fetchInvitations();
    } catch {
      toast.error("Failed to revoke");
    }
  };

  const STATUS_COLORS = { pending: "#ea580c", accepted: "#16a34a", revoked: "#dc2626" };

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "2rem" }}>Invite Users</h2>

      <div style={{ background: "#fff", padding: "1.5rem", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07)", maxWidth: 500, marginBottom: "2.5rem" }}>
        <h3 style={{ marginTop: 0, marginBottom: "1.25rem", fontSize: "1.1rem" }}>Send Invitation</h3>
        <form onSubmit={handleSend}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.4rem" }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
              style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid #d1d5db", borderRadius: 6 }}
            />
          </div>
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.4rem" }}>Role</label>
            <select value={role} onChange={e => setRole(e.target.value)}
              style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid #d1d5db", borderRadius: 6 }}>
              {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
          </div>
          <button type="submit" disabled={sending}
            style={{ padding: "0.7rem 1.5rem", background: sending ? "#9ca3af" : "#1a1a2e", color: "#fff", border: "none", borderRadius: 6, fontWeight: 500, cursor: "pointer" }}>
            {sending ? "Sending…" : "Send Invitation"}
          </button>
        </form>
      </div>

      <h3 style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>Recent Invitations</h3>
      {loadingList ? <p style={{ color: "#6b7280" }}>Loading…</p> : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                {["Email", "Role", "Status", "Sent", "Action"].map(h => (
                  <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.85rem", fontWeight: 600, color: "#374151" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invitations.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#9ca3af" }}>No invitations yet</td></tr>
              ) : invitations.map(inv => (
                <tr key={inv.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "0.75rem 1rem" }}>{inv.email}</td>
                  <td style={{ padding: "0.75rem 1rem", color: "#6b7280" }}>{inv.role}</td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span style={{ color: STATUS_COLORS[inv.status] || "#374151", fontWeight: 500, fontSize: "0.85rem" }}>{inv.status}</span>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", color: "#6b7280", fontSize: "0.85rem" }}>
                    {inv.created_at ? new Date(inv.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    {inv.status === "pending" && (
                      <button onClick={() => revoke(inv.id)}
                        style={{ padding: "0.3rem 0.7rem", border: "1px solid #dc2626", color: "#dc2626", background: "transparent", borderRadius: 4, fontSize: "0.8rem", cursor: "pointer" }}>
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
