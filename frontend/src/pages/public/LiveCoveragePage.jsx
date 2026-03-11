import React from "react";
import { useQuery } from "react-query";
import publicService from "../../services/publicService";
import liveService from "../../services/liveService";
import { timeAgo } from "../../utils/formatDate";

function toEmbedUrl(url) {
  if (!url) return url;
  if (url.includes("youtube.com/embed/")) return url;
  if (url.includes("facebook.com/plugins/video")) return url;
  let vid = null;
  const m1 = url.match(/[?&]v=([^&]+)/);
  if (m1) vid = m1[1];
  if (!vid) { const m2 = url.match(/youtu\.be\/([^?&]+)/); if (m2) vid = m2[1]; }
  if (!vid) { const m3 = url.match(/youtube\.com\/live\/([^?&]+)/); if (m3) vid = m3[1]; }
  if (vid) return `https://www.youtube.com/embed/${vid}?autoplay=1`;
  if (url.includes("facebook.com") || url.includes("fb.watch")) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&autoplay=true`;
  }
  return url;
}

const DIRECT_VIDEO = /\.(mp4|webm|ogg|m3u8)(\?|$)/i;

function StreamPlayer({ url, title }) {
  const [tryEmbed, setTryEmbed] = React.useState(false);
  if (!url) return null;
  if (DIRECT_VIDEO.test(url)) {
    return (
      <video
        src={url}
        controls
        autoPlay
        style={{ width: "100%", borderRadius: 8, background: "#000", display: "block" }}
      />
    );
  }
  const isFacebook = url.includes("facebook.com") || url.includes("fb.watch");
  if (isFacebook) {
    return (
      <div>
        <div style={{ background: "#1877f2", borderRadius: 8, padding: "2rem", textAlign: "center", marginBottom: "0.5rem" }}>
          <p style={{ color: "#fff", margin: "0 0 1rem", fontWeight: 700, fontSize: "1.05rem" }}>📺 {title || "Facebook Live Stream"}</p>
          <a href={url} target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-block", padding: "0.7rem 1.75rem", background: "#fff", color: "#1877f2", borderRadius: 6, fontWeight: 700, textDecoration: "none", fontSize: "0.95rem" }}>
            ▶ Watch on Facebook
          </a>
        </div>
        {!tryEmbed ? (
          <button onClick={() => setTryEmbed(true)}
            style={{ fontSize: "0.8rem", color: "#9ca3af", background: "none", border: "none", cursor: "pointer", padding: "0.25rem 0" }}>
            Try embed instead
          </button>
        ) : (
          <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 8, overflow: "hidden", marginTop: "0.5rem" }}>
            <iframe
              src={toEmbedUrl(url)}
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              title={title || "Live Stream"}
            />
          </div>
        )}
      </div>
    );
  }
  return (
    <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 8, overflow: "hidden" }}>
      <iframe
        src={toEmbedUrl(url)}
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        title={title || "Live Stream"}
      />
    </div>
  );
}

export default function LiveCoveragePage() {
  const { data: streamData } = useQuery("live-stream", publicService.live, { refetchInterval: 30000 });
  const stream = streamData?.data?.data;

  const { data: updatesData } = useQuery(
    ["live-updates", stream?.id],
    () => liveService.getUpdates(stream?.id ? { stream_id: stream.id } : {}),
    { refetchInterval: 15000 }
  );

  const updates = updatesData?.data?.data || [];

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <h1 style={{ fontSize: "1.8rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span style={{ background: "#e94560", color: "#fff", borderRadius: "9999px", padding: "0.2rem 0.75rem", fontSize: "0.9rem" }}>
          ● LIVE
        </span>
        Live Coverage
      </h1>

      {/* Live Video Stream */}
      {stream && stream.stream_url && (
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>{stream.title}</h2>
          <StreamPlayer url={stream.stream_url} title={stream.title} />
        </div>
      )}

      {!stream && (
        <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "2rem", textAlign: "center", color: "#6b7280", marginBottom: "2rem" }}>
          No live stream currently active.
        </div>
      )}

      {/* Live Text Updates */}
      <div>
        <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem", borderBottom: "2px solid #e94560", paddingBottom: "0.5rem" }}>
          Live Updates
        </h2>
        {updates.length === 0 ? (
          <p style={{ color: "#6b7280" }}>No live updates yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[...updates].reverse().map(update => (
              <div key={update.id} style={{
                display: "flex", gap: "1rem",
                borderLeft: "3px solid #e94560", paddingLeft: "1rem",
              }}>
                <span style={{ color: "#9ca3af", fontSize: "0.82rem", flexShrink: 0, minWidth: 80 }}>
                  {timeAgo(update.timestamp)}
                </span>
                <p style={{ fontSize: "0.95rem" }}>{update.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
