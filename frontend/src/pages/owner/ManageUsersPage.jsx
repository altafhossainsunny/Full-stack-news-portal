import React, { useEffect, useState } from "react";
import userService from "../../services/userService";
import toast from "react-hot-toast";

const ROLE_COLORS = { owner: "#7c3aed", publisher: "#0891b2", editor: "#16a34a", reporter: "#ea580c" };

export default function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [roleFilter, setRoleFilter] = useState("");

  const fetchUsers = () => {
    setLoading(true);
    setFetchError(null);
    userService.list({ role: roleFilter })
      .then(d => {
        const list = Array.isArray(d) ? d : (Array.isArray(d?.data) ? d.data : (d.users || []));
        setUsers(list);
      })
      .catch(err => {
        const msg = err?.response?.data?.error || err?.message || "Unknown error";
        setFetchError(msg);
        toast.error("Failed to load users: " + msg);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [roleFilter]);

  const toggle = async (user) => {
    try {
      if (user.is_active) {
        await userService.suspend(user.id);
        toast.success("User suspended");
      } else {
        await userService.activate(user.id);
        toast.success("User activated");
      }
      fetchUsers();
    } catch {
      toast.error("Action failed");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Permanently delete this user?")) return;
    try {
      await userService.delete(id);
      toast.success("User deleted");
      fetchUsers();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.5rem" }}>Manage Users</h2>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          style={{ padding: "0.5rem 1rem", border: "1px solid #d1d5db", borderRadius: 6 }}
        >
          <option value="">All Roles</option>
          <option value="publisher">Publisher</option>
          <option value="editor">Editor</option>
          <option value="reporter">Reporter</option>
        </select>
      </div>

      {loading ? <p style={{ color: "#6b7280" }}>Loading users…</p> : fetchError ? (
        <p style={{ color: "#dc2626", background: "#fef2f2", padding: "1rem", borderRadius: 6 }}>
          Error: {fetchError}
        </p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                {["Name", "Email", "Role", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.85rem", fontWeight: 600, color: "#374151" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#9ca3af" }}>No users found</td></tr>
              ) : users.map(u => (
                <tr key={u.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "0.75rem 1rem" }}>{u.name}</td>
                  <td style={{ padding: "0.75rem 1rem", color: "#6b7280" }}>{u.email}</td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span style={{
                      background: ROLE_COLORS[u.role] + "20", color: ROLE_COLORS[u.role],
                      padding: "0.2rem 0.6rem", borderRadius: 4, fontSize: "0.8rem", fontWeight: 600,
                    }}>{u.role}</span>
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span style={{
                      color: u.is_active ? "#16a34a" : "#dc2626",
                      fontWeight: 500, fontSize: "0.85rem",
                    }}>{u.is_active ? "Active" : "Suspended"}</span>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => toggle(u)}
                      style={{
                        padding: "0.35rem 0.75rem", border: "1px solid",
                        borderColor: u.is_active ? "#ea580c" : "#16a34a",
                        color: u.is_active ? "#ea580c" : "#16a34a",
                        background: "transparent", borderRadius: 4, fontSize: "0.8rem", cursor: "pointer",
                      }}
                    >{u.is_active ? "Suspend" : "Activate"}</button>
                    <button
                      onClick={() => deleteUser(u.id)}
                      style={{
                        padding: "0.35rem 0.75rem", border: "1px solid #dc2626",
                        color: "#dc2626", background: "transparent", borderRadius: 4, fontSize: "0.8rem", cursor: "pointer",
                      }}
                    >Delete</button>
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
