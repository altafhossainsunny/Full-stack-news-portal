import React, { useState, useEffect } from "react";
import adService from "../../services/adService";
import toast from "react-hot-toast";

const PLACEMENTS = ["header_banner", "mid_section_banner", "sidebar_banner", "article_page_banner", "footer_banner"];
const PLACEMENT_LABELS = {
  header_banner: "Header Banner (top of page)",
  mid_section_banner: "Mid-Section Banner (between Top Stories & Latest News)",
  sidebar_banner: "Sidebar Banner (Latest News sidebar)",
  article_page_banner: "Article Page Banner (inside article)",
  footer_banner: "Footer Banner (bottom of page)",
};

export default function ManageAdsPage() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", image_url: "", target_url: "", placement: "header_banner", is_active: true });

  const fetch = () => {
    setLoading(true);
    adService.list()
      .then(d => setAds(Array.isArray(d) ? d : []))
      .catch(() => toast.error("Failed to load ads"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const startEdit = (ad) => {
    setEditId(ad.id);
    setForm({ title: ad.title, image_url: ad.image_url || "", target_url: ad.target_url || "", placement: ad.placement, is_active: ad.is_active !== false });
    setShowForm(true);
  };

  const clear = () => { setEditId(null); setShowForm(false); setForm({ title: "", image_url: "", target_url: "", placement: "header_banner", is_active: true }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await adService.update(editId, form);
        toast.success("Ad updated");
      } else {
        await adService.create(form);
        toast.success("Ad created");
      }
      clear(); fetch();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed");
    } finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this ad?")) return;
    try { await adService.delete(id); toast.success("Deleted"); fetch(); }
    catch { toast.error("Failed"); }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.5rem" }}>Manage Advertisements</h2>
        <button onClick={() => setShowForm(!showForm)}
          style={{ padding: "0.65rem 1.25rem", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: 6, fontWeight: 500, cursor: "pointer" }}>
          {showForm ? "Cancel" : "+ New Ad"}
        </button>
      </div>

      {showForm && (
        <div style={{ background: "#fff", padding: "1.5rem", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07)", maxWidth: 540, marginBottom: "2rem" }}>
          <h3 style={{ marginTop: 0, fontSize: "1.1rem", marginBottom: "1.25rem" }}>{editId ? "Edit Ad" : "New Ad"}</h3>
          <form onSubmit={handleSubmit}>
            {[
              { field: "title", label: "Title", placeholder: "Ad title" },
              { field: "image_url", label: "Image URL", placeholder: "https://..." },
              { field: "target_url", label: "Destination URL", placeholder: "https://..." },
            ].map(({ field, label, placeholder }) => (
              <div key={field} style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.4rem" }}>{label}</label>
                <input value={form[field]} onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
                  placeholder={placeholder} style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid #d1d5db", borderRadius: 6 }} />
              </div>
            ))}
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.4rem" }}>Placement</label>
              <select value={form.placement} onChange={e => setForm(prev => ({ ...prev, placement: e.target.value }))}
                style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid #d1d5db", borderRadius: 6 }}>
                {PLACEMENTS.map(p => <option key={p} value={p}>{PLACEMENT_LABELS[p] || p}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))} />
              <label htmlFor="is_active" style={{ fontSize: "0.9rem" }}>Active</label>
            </div>
            <button type="submit" disabled={saving}
              style={{ padding: "0.65rem 1.25rem", background: saving ? "#9ca3af" : "#1a1a2e", color: "#fff", border: "none", borderRadius: 6, fontWeight: 500, cursor: "pointer" }}>
              {saving ? "Saving…" : editId ? "Update" : "Create"}
            </button>
          </form>
        </div>
      )}

      {loading ? <p style={{ color: "#6b7280" }}>Loading ads…</p> : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                {["Title", "Placement", "Status", "Clicks", "Impressions", "Actions"].map(h => (
                  <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.85rem", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ads.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#9ca3af" }}>No ads yet</td></tr>
              ) : ads.map(ad => (
                <tr key={ad.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "0.75rem 1rem", fontWeight: 500 }}>{ad.title}</td>
                  <td style={{ padding: "0.75rem 1rem", color: "#6b7280" }}>{ad.placement}</td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span style={{ color: ad.is_active ? "#16a34a" : "#dc2626", fontWeight: 500, fontSize: "0.85rem" }}>
                      {ad.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", color: "#6b7280" }}>{ad.clicks || 0}</td>
                  <td style={{ padding: "0.75rem 1rem", color: "#6b7280" }}>{ad.impressions || 0}</td>
                  <td style={{ padding: "0.75rem 1rem", display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => startEdit(ad)}
                      style={{ padding: "0.3rem 0.7rem", border: "1px solid #0891b2", color: "#0891b2", background: "transparent", borderRadius: 4, fontSize: "0.8rem", cursor: "pointer" }}>
                      Edit
                    </button>
                    <button onClick={() => remove(ad.id)}
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
