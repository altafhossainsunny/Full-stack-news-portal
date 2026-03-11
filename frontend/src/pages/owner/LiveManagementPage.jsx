import React, { useEffect, useState } from "react";
import liveService from "../../services/liveService";
import toast from "react-hot-toast";

function toEmbedUrl(url) {
  if (!url) return url;
  if (url.includes("youtube.com/embed/")) return url;
  if (url.includes("facebook.com/plugins/video")) return url;
  let vid = null;
  const m1 = url.match(/[?&]v=([^&]+)/);
  if (m1) vid = m1[1];
  if (!vid) { const m2 = url.match(/youtu\.be\/([^?&]+)/); if (m2) vid = m2[1]; }
  if (!vid) { const m3 = url.match(/youtube\.com\/live\/([^?&]+)/); if (m3) vid = m3[1]; }
  if (vid) return `https://www.youtube.com/embed/${vid}`;
  if (url.includes("facebook.com") || url.includes("fb.watch")) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&autoplay=true`;
  }
  return url;
}

export default function LiveManagementPage() {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", stream_url: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [updateText, setUpdateText] = useState("");
  const [postingUpdate, setPostingUpdate] = useState(false);

  const load = () => {
    setLoading(true);
    liveService.listStreams()
      .then(d => setStreams(Array.isArray(d) ? d : (d?.streams || [])))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const activeStream = streams.find(s => s.is_active);

  const startStream = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await liveService.startStream({ ...form, stream_url: toEmbedUrl(form.stream_url) });
      toast.success("Stream started");
      setForm({ title: "", stream_url: "", description: "" });
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to start stream");
    } finally { setSaving(false); }
  };

  const endStream = async (id) => {
    if (!window.confirm("End this live stream?")) return;
    try { await liveService.endStream(id); toast.success("Stream ended"); load(); }
    catch { toast.error("Failed to end stream"); }
  };

  const postUpdate = async () => {
    if (!updateText.trim() || !activeStream) return;
    setPostingUpdate(true);
    try {
      const sid = activeStream._id || activeStream.id;
      await liveService.addUpdate(sid, { content: updateText, stream_id: sid });
      toast.success("Update posted");
      setUpdateText("");
    } catch { toast.error("Failed to post update"); }
    finally { setPostingUpdate(false); }
  };

  const F = ({ label, value, onChange, placeholder, type = "text", required }) => (
    <div>
      <label style={{ color: "#94a3b8", fontSize: "0.83rem", display: "block", marginBottom: "0.35rem" }}>{label}{required && " *"}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required}
        style={{ width: "100%", padding: "0.65rem", background: "rgba(0,0,0,0.35)",
          border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0", borderRadius: 8, boxSizing: "border-box" }} />
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ color: "#f8fafc", fontSize: "1.5rem", margin: 0 }}>Live Coverage</h2>
        <button onClick={() => setShowForm(v => !v)}
          style={{ padding: "0.6rem 1.25rem", background: showForm ? "rgba(255,255,255,0.05)" : "#3b82f6",
            color: showForm ? "#94a3b8" : "#fff", border: showForm ? "1px solid rgba(255,255,255,0.1)" : "none",
            borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
          {showForm ? "Cancel" : "+ New Stream"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={startStream} style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h3 style={{ color: "#f8fafc", marginTop: 0, marginBottom: "1.25rem" }}>Start New Live Stream</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <F label="Title" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} required />
            <F label="Stream URL" value={form.stream_url} onChange={v => setForm(f => ({ ...f, stream_url: v }))} placeholder="YouTube, Facebook, or direct video link (.mp4, .m3u8)" required />
          </div>
          {(form.stream_url.includes("facebook.com") || form.stream_url.includes("fb.watch")) && (
            <div style={{ padding: "0.6rem 0.85rem", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.4)", borderRadius: 8, marginBottom: "1rem", fontSize: "0.82rem", color: "#fcd34d" }}>
              ⚠️ Facebook videos must be set to <strong style={{ color: "#fde68a" }}>Public</strong> on Facebook. Viewers will see a direct "Watch on Facebook" button instead of an embed.
            </div>
          )}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ color: "#94a3b8", fontSize: "0.83rem", display: "block", marginBottom: "0.35rem" }}>Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
              style={{ width: "100%", padding: "0.65rem", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0", borderRadius: 8, resize: "vertical", boxSizing: "border-box" }} />
          </div>
          <button type="submit" disabled={saving}
            style={{ padding: "0.7rem 2rem", background: saving ? "#374151" : "#10b981", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
            {saving ? "Starting…" : "🔴 Go Live"}
          </button>
        </form>
      )}

      {/* Active stream panel */}
      {activeStream && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
                <span style={{ width: 8, height: 8, background: "#ef4444", borderRadius: "50%", display: "inline-block" }} />
                <span style={{ color: "#fca5a5", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "1px" }}>LIVE NOW</span>
              </div>
              <h3 style={{ color: "#f8fafc", margin: "0 0 0.25rem" }}>{activeStream.title}</h3>
              <a href={activeStream.stream_url} target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa", fontSize: "0.85rem" }}>{activeStream.stream_url}</a>
            </div>
            <button onClick={() => endStream(activeStream._id || activeStream.id)}
              style={{ padding: "0.5rem 1.25rem", background: "#dc2626", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>End Stream</button>
          </div>
          <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.75rem" }}>
            <input value={updateText} onChange={e => setUpdateText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && postUpdate()}
              placeholder="Post a live text update… (Enter to send)"
              style={{ flex: 1, padding: "0.65rem", background: "rgba(0,0,0,0.35)",
                border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0", borderRadius: 8 }} />
            <button onClick={postUpdate} disabled={postingUpdate}
              style={{ padding: "0.65rem 1.25rem", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
              {postingUpdate ? "Posting…" : "Post"}
            </button>
          </div>
        </div>
      )}

      {/* All streams */}
      <div style={{ background: "rgba(15,23,42,0.6)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div style={{ padding: "0.85rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", color: "#64748b", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>All Streams</div>
        {loading ? (
          <p style={{ color: "#475569", padding: "2rem" }}>Loading…</p>
        ) : streams.length === 0 ? (
          <p style={{ color: "#475569", padding: "2rem", textAlign: "center" }}>No streams yet. Start your first live stream.</p>
        ) : streams.map(s => (
          <div key={s._id || s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <div>
              <div style={{ color: "#e2e8f0", fontWeight: 500 }}>{s.title}</div>
              <div style={{ color: "#475569", fontSize: "0.8rem", marginTop: "0.2rem" }}>{s.stream_url}</div>
              {s.created_at && <div style={{ color: "#334155", fontSize: "0.75rem", marginTop: "0.2rem" }}>{new Date(s.created_at).toLocaleString()}</div>}
            </div>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: s.is_active ? "#4ade80" : "#475569" }}>
                {s.is_active ? "● LIVE" : "Ended"}
              </span>
              {s.is_active && (
                <button onClick={() => endStream(s._id || s.id)}
                  style={{ padding: "0.3rem 0.75rem", background: "rgba(220,38,38,0.12)", border: "1px solid #dc2626", color: "#f87171", borderRadius: 6, cursor: "pointer", fontSize: "0.8rem" }}>End</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
