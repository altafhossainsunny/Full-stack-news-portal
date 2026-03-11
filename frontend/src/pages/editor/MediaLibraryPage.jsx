import React, { useState, useEffect, useCallback } from "react";
import mediaService from "../../services/mediaService";
import toast from "react-hot-toast";

const FOLDERS = ["articles", "reports", "ads", "live", "general"];
const MIME_ICONS = { image: "🖼", video: "🎬", audio: "🎵", application: "📎" };

export default function MediaLibraryPage() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [folder, setFolder] = useState("articles");
  const [uploading, setUploading] = useState(false);

  const fetch = useCallback(() => {
    setLoading(true);
    mediaService.listByFolder(folder)
      .then(d => setMedia(d.media || []))
      .catch(() => toast.error("Failed to load media"))
      .finally(() => setLoading(false));
  }, [folder]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      await mediaService.upload(file, folder);
      toast.success("File uploaded");
      fetch();
    } catch { toast.error("Upload failed"); }
    finally { setUploading(false); e.target.value = ""; }
  };

  const remove = async (id, url) => {
    if (!window.confirm("Delete this file?")) return;
    try { await mediaService.delete(id); toast.success("Deleted"); fetch(); }
    catch { toast.error("Delete failed"); }
  };

  const copyUrl = (url) => {
    navigator.clipboard?.writeText(window.location.origin + url);
    toast.success("URL copied to clipboard");
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.5rem" }}>Media Library</h2>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <select value={folder} onChange={e => setFolder(e.target.value)}
            style={{ padding: "0.5rem 1rem", border: "1px solid #d1d5db", borderRadius: 6 }}>
            {FOLDERS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <input type="file" id="media-upload" style={{ display: "none" }} onChange={handleUpload} />
          <label htmlFor="media-upload"
            style={{ padding: "0.55rem 1.1rem", background: uploading ? "#9ca3af" : "#1a1a2e", color: "#fff", borderRadius: 6, cursor: "pointer", fontSize: "0.9rem" }}>
            {uploading ? "Uploading…" : "Upload File"}
          </label>
        </div>
      </div>

      {loading ? <p style={{ color: "#6b7280" }}>Loading…</p> : media.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 10, padding: "3rem", textAlign: "center", color: "#9ca3af" }}>No files in {folder}</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem" }}>
          {media.map(m => {
            const mime = m.mime_type?.split("/")[0] || "application";
            const icon = MIME_ICONS[mime] || "📎";
            const isImage = mime === "image";
            return (
              <div key={m._id} style={{ background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column" }}>
                {isImage ? (
                  <img src={m.url} alt={m.filename} style={{ width: "100%", height: 120, objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: 120, background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem" }}>
                    {icon}
                  </div>
                )}
                <div style={{ padding: "0.65rem 0.75rem", flex: 1 }}>
                  <p style={{ margin: "0 0 0.25rem", fontSize: "0.8rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {m.filename || m.original_name}
                  </p>
                  <p style={{ margin: 0, fontSize: "0.73rem", color: "#9ca3af" }}>
                    {m.size ? (m.size / 1024).toFixed(1) + " KB" : "—"}
                  </p>
                </div>
                <div style={{ padding: "0.5rem 0.75rem", borderTop: "1px solid #f3f4f6", display: "flex", gap: "0.35rem" }}>
                  <button onClick={() => copyUrl(m.url)}
                    style={{ flex: 1, padding: "0.3rem", background: "#f3f4f6", border: "none", borderRadius: 4, fontSize: "0.75rem", cursor: "pointer" }}>
                    Copy URL
                  </button>
                  <button onClick={() => remove(m._id, m.url)}
                    style={{ padding: "0.3rem 0.55rem", background: "transparent", border: "1px solid #dc2626", color: "#dc2626", borderRadius: 4, fontSize: "0.75rem", cursor: "pointer" }}>
                    Del
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
