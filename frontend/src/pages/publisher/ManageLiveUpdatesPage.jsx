import React, { useState, useEffect } from "react";
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

export default function ManageLiveUpdatesPage() {
  const [streams, setStreams] = useState([]);
  const [activeStream, setActiveStream] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loadingStreams, setLoadingStreams] = useState(true);
  const [loadingUpdates, setLoadingUpdates] = useState(false);
  const [updateText, setUpdateText] = useState("");
  const [postingUpdate, setPostingUpdate] = useState(false);

  // New stream form
  const [showStreamForm, setShowStreamForm] = useState(false);
  const [streamForm, setStreamForm] = useState({ title: "", stream_url: "", description: "" });
  const [startingStream, setStartingStream] = useState(false);

  const fetchStreams = () => {
    setLoadingStreams(true);
    liveService.listStreams()
      .then(d => setStreams(Array.isArray(d) ? d : []))
      .catch(() => toast.error("Failed to load streams"))
      .finally(() => setLoadingStreams(false));
  };

  const loadUpdates = (streamId) => {
    setLoadingUpdates(true);
    liveService.getUpdates(streamId)
      .then(d => setUpdates(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoadingUpdates(false));
  };

  useEffect(() => { fetchStreams(); }, []);

  const selectStream = (stream) => {
    setActiveStream(stream);
    loadUpdates(stream.id);
  };

  const startStream = async (e) => {
    e.preventDefault();
    if (!streamForm.title.trim()) return;
    setStartingStream(true);
    try {
      await liveService.startStream({ ...streamForm, stream_url: toEmbedUrl(streamForm.stream_url) });
      toast.success("Live stream started");
      setShowStreamForm(false);
      setStreamForm({ title: "", stream_url: "", description: "" });
      fetchStreams();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to start stream");
    } finally { setStartingStream(false); }
  };

  const endStream = async (id) => {
    if (!window.confirm("End this live stream?")) return;
    try {
      await liveService.endStream(id);
      toast.success("Stream ended");
      if (activeStream?.id === id) setActiveStream(null);
      fetchStreams();
    } catch { toast.error("Failed"); }
  };

  const postUpdate = async (e) => {
    e.preventDefault();
    if (!updateText.trim() || !activeStream) return;
    setPostingUpdate(true);
    try {
      await liveService.addUpdate(activeStream.id, { content: updateText });
      toast.success("Update posted");
      setUpdateText("");
      loadUpdates(activeStream.id);
    } catch { toast.error("Failed to post update"); }
    finally { setPostingUpdate(false); }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.5rem" }}>Live Coverage</h2>
        <button onClick={() => setShowStreamForm(!showStreamForm)}
          style={{ padding: "0.65rem 1.25rem", background: "#dc2626", color: "#fff", border: "none", borderRadius: 6, fontWeight: 500, cursor: "pointer" }}>
          {showStreamForm ? "Cancel" : "▶ Start Stream"}
        </button>
      </div>

      {showStreamForm && (
        <div style={{ background: "#fff", padding: "1.5rem", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07)", maxWidth: 520, marginBottom: "2rem" }}>
          <h3 style={{ marginTop: 0, fontSize: "1.1rem" }}>New Live Stream</h3>
          <form onSubmit={startStream}>
            {[  
              { f: "title", l: "Stream Title", ph: "e.g. Election Night Live Coverage", req: true },
              { f: "stream_url", l: "Stream URL", ph: "YouTube, Facebook, or direct video link (.mp4, .m3u8)" },
              { f: "description", l: "Description", ph: "Brief description of the coverage" },
            ].map(({ f, l, ph, req }) => (
              <div key={f} style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.4rem" }}>{l}</label>
                <input value={streamForm[f]} onChange={e => setStreamForm(p => ({ ...p, [f]: e.target.value }))}
                  placeholder={ph} required={req}
                  style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid #d1d5db", borderRadius: 6 }} />
              </div>
            ))}
            {(streamForm.stream_url.includes("facebook.com") || streamForm.stream_url.includes("fb.watch")) && (
              <div style={{ padding: "0.6rem 0.85rem", background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 6, marginBottom: "1rem", fontSize: "0.82rem", color: "#92400e" }}>
                ⚠️ Facebook videos must be set to <strong>Public</strong> on Facebook. Viewers will see a direct "Watch on Facebook" button (Facebook blocks embedding on most domains).
              </div>
            )}
            <button type="submit" disabled={startingStream}
              style={{ padding: "0.65rem 1.25rem", background: startingStream ? "#9ca3af" : "#dc2626", color: "#fff", border: "none", borderRadius: 6, fontWeight: 500, cursor: "pointer" }}>
              {startingStream ? "Starting…" : "Go Live"}
            </button>
          </form>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.5rem" }}>
        {/* Streams List */}
        <div>
          <h3 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>All Streams</h3>
          {loadingStreams ? <p style={{ color: "#6b7280" }}>Loading…</p> : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {streams.length === 0 ? (
                <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>No streams yet</p>
              ) : streams.map(s => (
                <div key={s.id}
                  onClick={() => selectStream(s)}
                  style={{
                    background: activeStream?.id === s.id ? "#1a1a2e" : "#fff",
                    color: activeStream?.id === s.id ? "#fff" : "#1a1a2e",
                    padding: "0.85rem 1rem", borderRadius: 8,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.07)", cursor: "pointer",
                  }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 500, fontSize: "0.9rem" }}>{s.title}</span>
                    <span style={{
                      fontSize: "0.75rem", fontWeight: 600, padding: "0.15rem 0.45rem", borderRadius: 3,
                      background: s.is_live ? "#dc262620" : "#f3f4f6",
                      color: s.is_live ? "#dc2626" : "#9ca3af",
                    }}>
                      {s.is_live ? "LIVE" : "ENDED"}
                    </span>
                  </div>
                  {s.is_live && (
                    <button
                      onClick={e => { e.stopPropagation(); endStream(s.id); }}
                      style={{ marginTop: "0.5rem", padding: "0.25rem 0.65rem", background: "transparent", border: "1px solid #dc2626", color: "#dc2626", borderRadius: 3, fontSize: "0.75rem", cursor: "pointer" }}>
                      End Stream
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Updates Panel */}
        <div>
          {activeStream ? (
            <>
              <h3 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>Updates for: {activeStream.title}</h3>

              {activeStream.is_live && (
                <form onSubmit={postUpdate} style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem" }}>
                  <input value={updateText} onChange={e => setUpdateText(e.target.value)} placeholder="Post a live update…"
                    style={{ flex: 1, padding: "0.65rem 0.85rem", border: "1px solid #d1d5db", borderRadius: 6 }} />
                  <button type="submit" disabled={postingUpdate}
                    style={{ padding: "0.65rem 1rem", background: postingUpdate ? "#9ca3af" : "#dc2626", color: "#fff", border: "none", borderRadius: 6, fontWeight: 500, cursor: "pointer" }}>
                    {postingUpdate ? "Posting…" : "Post"}
                  </button>
                </form>
              )}

              {loadingUpdates ? <p style={{ color: "#6b7280" }}>Loading updates…</p> : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: 420, overflowY: "auto" }}>
                  {updates.length === 0 ? (
                    <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>No updates posted yet</p>
                  ) : [...updates].reverse().map(u => (
                    <div key={u.id} style={{ background: "#fff", padding: "0.85rem 1rem", borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                      <p style={{ margin: "0 0 0.35rem", fontSize: "0.9rem" }}>{u.content}</p>
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "#9ca3af" }}>
                        {u.created_at ? new Date(u.created_at).toLocaleTimeString() : "—"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ background: "#fff", borderRadius: 10, padding: "3rem", textAlign: "center", color: "#9ca3af" }}>
              Select a stream to view or post updates
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
