import React, { useState, useEffect } from "react";
import cornerService from "../../services/cornerService";
import toast from "react-hot-toast";

export default function ManageCornersPage() {
  const [corners, setCorners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetch = () => {
    setLoading(true);
    cornerService.list()
      .then(d => setCorners(Array.isArray(d) ? d : []))
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const startEdit = (c) => { setEditId(c.id); setName(c.name); setDescription(c.description || ""); };
  const clear = () => { setEditId(null); setName(""); setDescription(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (editId) {
        await cornerService.update(editId, { name, description });
        toast.success("Corner updated");
      } else {
        await cornerService.create({ name, description });
        toast.success("Corner created");
      }
      clear(); fetch();
    } catch (err) {
      toast.error(err.response?.data?.error || "Action failed");
    } finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this corner?")) return;
    try { await cornerService.delete(id); toast.success("Corner deleted"); fetch(); }
    catch { toast.error("Delete failed"); }
  };

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "2rem" }}>Manage Corners</h2>
      <p style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "2rem" }}>
        Corners are custom editorial sections (e.g. "Opinion", "Tech Corner", "Youth Voice").
      </p>

      <div style={{ background: "#fff", padding: "1.5rem", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07)", maxWidth: 480, marginBottom: "2.5rem" }}>
        <h3 style={{ marginTop: 0, fontSize: "1.1rem", marginBottom: "1.25rem" }}>{editId ? "Edit Corner" : "New Corner"}</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.4rem" }}>Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Opinion" required
              style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid #d1d5db", borderRadius: 6 }} />
          </div>
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.4rem" }}>Description</label>
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description"
              style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid #d1d5db", borderRadius: 6 }} />
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="submit" disabled={saving}
              style={{ padding: "0.65rem 1.25rem", background: saving ? "#9ca3af" : "#1a1a2e", color: "#fff", border: "none", borderRadius: 6, fontWeight: 500, cursor: "pointer" }}>
              {saving ? "Saving…" : editId ? "Update" : "Create"}
            </button>
            {editId && (
              <button type="button" onClick={clear}
                style={{ padding: "0.65rem 1.25rem", background: "transparent", border: "1px solid #d1d5db", borderRadius: 6, cursor: "pointer" }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {loading ? <p style={{ color: "#6b7280" }}>Loading…</p> : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                {["Name", "Slug", "Description", "Actions"].map(h => (
                  <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.85rem", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {corners.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "#9ca3af" }}>No corners yet</td></tr>
              ) : corners.map(c => (
                <tr key={c.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "0.75rem 1rem", fontWeight: 500 }}>{c.name}</td>
                  <td style={{ padding: "0.75rem 1rem", color: "#6b7280", fontFamily: "monospace", fontSize: "0.85rem" }}>{c.slug}</td>
                  <td style={{ padding: "0.75rem 1rem", color: "#6b7280", fontSize: "0.85rem" }}>{c.description || "—"}</td>
                  <td style={{ padding: "0.75rem 1rem", display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => startEdit(c)}
                      style={{ padding: "0.3rem 0.7rem", border: "1px solid #0891b2", color: "#0891b2", background: "transparent", borderRadius: 4, fontSize: "0.8rem", cursor: "pointer" }}>
                      Edit
                    </button>
                    <button onClick={() => remove(c.id)}
                      style={{ padding: "0.3rem 0.7rem", border: "1px solid #dc2626", color: "#dc2626", background: "transparent", borderRadius: 4, fontSize: "0.8rem", cursor: "pointer" }}>
                      Delete
                    </button>
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
