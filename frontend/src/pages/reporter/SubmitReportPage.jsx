import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import reportService from "../../services/reportService";
import translationService from "../../services/translationService";
import toast from "react-hot-toast";

const LANGUAGES = [
  { code: "bn", label: "Bengali" }, { code: "en", label: "English" },
  { code: "ar", label: "Arabic" }, { code: "hi", label: "Hindi" },
  { code: "ur", label: "Urdu" }, { code: "auto", label: "Auto-detect" },
];

export default function SubmitReportPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", content: "", language: "bn", location: "", incident_date: "" });
  const [mediaFiles, setMediaFiles] = useState([]);
  const [audioFile, setAudioFile] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [translatedPreview, setTranslatedPreview] = useState("");

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + mediaFiles.length > 5) { toast.error("Maximum 5 media files"); return; }
    setMediaFiles(prev => [...prev, ...files]);
  };

  const removeMedia = (i) => setMediaFiles(prev => prev.filter((_, idx) => idx !== i));

  const handleTranslate = async () => {
    if (!form.content.trim()) { toast.error("Write content first"); return; }
    setTranslating(true);
    try {
      const d = await translationService.translateText({ text: form.content, source_lang: form.language });
      setTranslatedPreview(d.translated_text || "");
      toast.success("Translation ready (preview only)");
    } catch { toast.error("Translation failed"); }
    finally { setTranslating(false); }
  };

  const handleTranscribe = async () => {
    if (!audioFile) { toast.error("Upload an audio file first"); return; }
    setTranscribing(true);
    try {
      const fd = new FormData();
      fd.append("audio", audioFile);
      const d = await translationService.transcribeAudio(fd);
      setForm(p => ({ ...p, content: p.content + (p.content ? "\n\n" : "") + (d.transcript || "") }));
      toast.success("Audio transcribed");
    } catch { toast.error("Transcription failed"); }
    finally { setTranscribing(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    if (!form.content.trim()) { toast.error("Content is required"); return; }
    setSubmitting(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
    mediaFiles.forEach(f => fd.append("media", f));
    if (audioFile) fd.append("audio", audioFile);
    try {
      await reportService.submit(fd);
      toast.success("Report submitted successfully!");
      navigate("/reporter/reports");
    } catch (err) {
      toast.error(err.response?.data?.error || "Submission failed");
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{ maxWidth: 780 }}>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>Submit Report</h2>
      <p style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "2rem" }}>
        Submit a report in your local language. Use the AI Translation feature to preview an English version before submitting.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.4rem" }}>Report Title *</label>
            <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Brief headline for your report" required
              style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid #d1d5db", borderRadius: 6 }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.4rem" }}>Language *</label>
            <select value={form.language} onChange={e => set("language", e.target.value)}
              style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid #d1d5db", borderRadius: 6 }}>
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.4rem" }}>Location</label>
            <input value={form.location} onChange={e => set("location", e.target.value)} placeholder="e.g. Dhaka, Bangladesh"
              style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid #d1d5db", borderRadius: 6 }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.4rem" }}>Incident Date</label>
            <input type="date" value={form.incident_date} onChange={e => set("incident_date", e.target.value)}
              style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid #d1d5db", borderRadius: 6 }} />
          </div>
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
            <label style={{ fontSize: "0.9rem", fontWeight: 500 }}>Report Content *</label>
            <button type="button" onClick={handleTranslate} disabled={translating}
              style={{ padding: "0.3rem 0.75rem", background: translating ? "#9ca3af" : "#7c3aed", color: "#fff", border: "none", borderRadius: 4, fontSize: "0.8rem", cursor: "pointer" }}>
              {translating ? "Translating…" : "🌐 AI Translate (preview)"}
            </button>
          </div>
          <textarea value={form.content} onChange={e => set("content", e.target.value)} rows={10} required
            placeholder="Write your report here. You can write in Bengali, Arabic, Hindi, or any supported language."
            style={{ width: "100%", padding: "0.75rem 0.85rem", border: "1px solid #d1d5db", borderRadius: 6, resize: "vertical", fontFamily: "inherit" }} />
        </div>

        {translatedPreview && (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "1rem" }}>
            <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", fontWeight: 600, color: "#16a34a" }}>AI Translation Preview (English)</p>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "#374151", whiteSpace: "pre-wrap" }}>{translatedPreview}</p>
          </div>
        )}

        {/* Audio upload + transcription */}
        <div style={{ background: "#fff", padding: "1.25rem", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <h4 style={{ marginTop: 0, fontSize: "0.95rem" }}>Audio Recording (optional)</h4>
          <p style={{ fontSize: "0.85rem", color: "#6b7280", marginTop: 0, marginBottom: "0.75rem" }}>
            Upload an audio recording. Use "Transcribe" to convert speech to text automatically.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
            <input type="file" accept="audio/*" onChange={e => setAudioFile(e.target.files[0] || null)} id="audio-file"
              style={{ display: "none" }} />
            <label htmlFor="audio-file"
              style={{ padding: "0.5rem 0.9rem", border: "1px dashed #d1d5db", borderRadius: 6, cursor: "pointer", fontSize: "0.85rem", color: "#6b7280" }}>
              {audioFile ? audioFile.name : "Choose audio file"}
            </label>
            {audioFile && (
              <button type="button" onClick={handleTranscribe} disabled={transcribing}
                style={{ padding: "0.5rem 0.9rem", background: transcribing ? "#9ca3af" : "#0891b2", color: "#fff", border: "none", borderRadius: 6, fontSize: "0.85rem", cursor: "pointer" }}>
                {transcribing ? "Transcribing…" : "🎙 Transcribe"}
              </button>
            )}
          </div>
        </div>

        {/* Media files */}
        <div style={{ background: "#fff", padding: "1.25rem", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <h4 style={{ marginTop: 0, fontSize: "0.95rem" }}>Media Files (up to 5)</h4>
          <input type="file" accept="image/*,video/*" multiple onChange={handleMediaChange} id="media-files" style={{ display: "none" }} />
          <label htmlFor="media-files"
            style={{ display: "block", padding: "0.65rem", border: "1px dashed #d1d5db", borderRadius: 6, textAlign: "center", cursor: "pointer", fontSize: "0.85rem", color: "#6b7280" }}>
            Click to attach images or videos
          </label>
          {mediaFiles.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.75rem" }}>
              {mediaFiles.map((f, i) => (
                <div key={i} style={{ background: "#f3f4f6", padding: "0.3rem 0.65rem", borderRadius: 4, fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  {f.name.slice(0, 24)}{f.name.length > 24 ? "…" : ""}
                  <button type="button" onClick={() => removeMedia(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: "0.9rem", padding: 0, lineHeight: 1 }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <button type="submit" disabled={submitting}
            style={{ padding: "0.75rem 2rem", background: submitting ? "#9ca3af" : "#ea580c", color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, fontSize: "1rem", cursor: "pointer" }}>
            {submitting ? "Submitting…" : "Submit Report"}
          </button>
        </div>
      </form>
    </div>
  );
}
