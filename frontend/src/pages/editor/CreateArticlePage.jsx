import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import articleService from "../../services/articleService";
import categoryService from "../../services/categoryService";
import cornerService from "../../services/cornerService";
import tagService from "../../services/tagService";
import mediaService from "../../services/mediaService";
import toast from "react-hot-toast";
import { imgUrl } from "../../utils/imageUrl";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

// CKEditor upload adapter — handles paste/drop images inside the editor
function BgnUploadAdapterPlugin(editor) {
  editor.plugins.get("FileRepository").createUploadAdapter = (loader) => ({
    upload: () =>
      loader.file
        .then((file) => mediaService.upload(file, "articles"))
        .then((d) => {
          const url = d.url || "";
          return { default: url.startsWith("http") ? url : `${API_BASE}${url}` };
        }),
    abort: () => {},
  });
}

// CKEditor is loaded via CDN in index.html to avoid bundler issues with @ckeditor packages
// If CKEditor is available globally as window.ClassicEditor use it, otherwise fall back to textarea
function RichEditor({ value, onChange }) {
  const ref = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const CE = window.ClassicEditor;
    if (!CE) return;
    CE.create(ref.current, {
      toolbar: ["heading", "|", "bold", "italic", "link", "blockQuote", "bulletedList", "numberedList", "|", "imageUpload", "mediaEmbed", "|", "undo", "redo"],
      extraPlugins: [BgnUploadAdapterPlugin],
    }).then(editor => {
      editorRef.current = editor;
      editor.setData(value || "");
      editor.model.document.on("change:data", () => {
        onChange(editor.getData());
      });
    }).catch(console.error);
    return () => { editorRef.current?.destroy(); };
  }, []);

  if (!window.ClassicEditor) {
    return (
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={18}
        placeholder="Write your article content here (HTML supported)…"
        style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: 6, fontFamily: "inherit", fontSize: "0.9rem", resize: "vertical" }}
      />
    );
  }

  return <div ref={ref} style={{ border: "1px solid #d1d5db", borderRadius: 6 }} />;
}

export default function CreateArticlePage() {
  const { id } = useParams(); // present on edit mode
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const canPublish = user?.role === "owner" || user?.role === "publisher";
  const getEditPath = (artId) => canPublish
    ? (user?.role === "owner" ? `/owner/articles/${artId}/edit` : `/publisher/articles/${artId}/edit`)
    : `/editor/articles/${artId}/edit`;
  const getListPath = () => user?.role === "owner" ? "/owner/articles" : user?.role === "publisher" ? "/publisher/published" : "/editor/articles";

  const [categories, setCategories] = useState([]);
  const [corners, setCorners] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    title: "", subtitle: "", summary: "", content: "",
    category_id: "", corner_id: "", tags: [],
    featured_image: "", video_link: "", language: "en",
  });

  useEffect(() => {
    categoryService.list().then(d => setCategories(Array.isArray(d) ? d : [])).catch(() => {});
    cornerService.list().then(d => setCorners(Array.isArray(d) ? d : [])).catch(() => {});
    if (isEdit) {
      articleService.get(id)
        .then(d => {
          const art = d.article || d;
          setForm({
            title: art.title || "",
            subtitle: art.subtitle || "",
            summary: art.summary || "",
            content: art.content || "",
            category_id: art.category_id || "",
            corner_id: art.corner_id || "",
            tags: art.tags || [],
            featured_image: art.featured_image || "",
            video_link: art.video_link || "",
            language: art.language || "en",
          });
        })
        .catch(() => toast.error("Failed to load article"));
    }
  }, [id]);

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }));

  const searchTags = async (q) => {
    if (!q.trim()) { setTagSuggestions([]); return; }
    try {
      const d = await tagService.search(q);
      setTagSuggestions(Array.isArray(d) ? d.map(t => t.name || t) : []);
    } catch { setTagSuggestions([]); }
  };

  const addTag = (name) => {
    const n = name.trim().toLowerCase();
    if (n && !form.tags.includes(n)) set("tags", [...form.tags, n]);
    setTagInput(""); setTagSuggestions([]);
  };

  const removeTag = (t) => set("tags", form.tags.filter(x => x !== t));

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const d = await mediaService.upload(file, "articles");
      set("featured_image", d.url);
      toast.success("Image uploaded");
    } catch { toast.error("Upload failed"); }
    finally { setUploading(false); }
  };

  // Upload a raw File object (used by paste / drag-drop handlers)
  const uploadImageFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Only image files are supported (JPG, PNG, GIF, WebP)");
      return;
    }
    setUploading(true);
    try {
      const d = await mediaService.upload(file, "articles");
      set("featured_image", d.url);
      toast.success("Image uploaded");
    } catch { toast.error("Upload failed"); }
    finally { setUploading(false); }
  };

  const handleImagePaste = (e) => {
    const items = Array.from(e.clipboardData?.items || []);
    const imgItem = items.find(i => i.type.startsWith("image/"));
    if (!imgItem) return;
    e.preventDefault();
    uploadImageFile(imgItem.getAsFile());
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer?.files?.[0];
    if (file) uploadImageFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const validate = () => {
    if (!form.title.trim()) { toast.error("Title is required"); return false; }
    if (!form.content.trim()) { toast.error("Article content is required"); return false; }
    if (!form.category_id) { toast.error("Please select a category"); return false; }
    return true;
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      if (isEdit) {
        await articleService.update(id, form);
        toast.success("Draft saved");
      } else {
        const d = await articleService.create(form);
        toast.success("Draft saved");
        navigate(getEditPath(d.article_id));
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Save failed");
    } finally { setSaving(false); }
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      let artId = id;
      if (!isEdit) {
        const d = await articleService.create(form);
        artId = d.article_id;
      } else {
        await articleService.update(id, form);
      }
      await articleService.submit(artId);
      toast.success("Article submitted for review!");
      navigate(getListPath());
    } catch (err) {
      toast.error(err.response?.data?.error || "Submit failed");
    } finally { setSubmitting(false); }
  };

  const handlePublish = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      let artId = id;
      if (!isEdit) {
        const d = await articleService.create(form);
        artId = d.article_id;
      } else {
        await articleService.update(id, form);
      }
      await articleService.approve(artId);
      await articleService.publish(artId);
      toast.success("Article published!");
      navigate(getListPath());
    } catch (err) {
      toast.error(err.response?.data?.error || "Publish failed");
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.5rem" }}>{isEdit ? "Edit Article" : "Write Article"}</h2>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={handleSave} disabled={saving}
            style={{ padding: "0.65rem 1.25rem", background: "transparent", border: "1px solid #1a1a2e", color: "#1a1a2e", borderRadius: 6, fontWeight: 500, cursor: "pointer" }}>
            {saving ? "Saving…" : "Save Draft"}
          </button>
          {canPublish ? (
            <button onClick={handlePublish} disabled={submitting}
              style={{ padding: "0.65rem 1.25rem", background: submitting ? "#9ca3af" : "#16a34a", color: "#fff", border: "none", borderRadius: 6, fontWeight: 500, cursor: "pointer" }}>
              {submitting ? "Publishing…" : "Publish Now"}
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              style={{ padding: "0.65rem 1.25rem", background: submitting ? "#9ca3af" : "#16a34a", color: "#fff", border: "none", borderRadius: 6, fontWeight: 500, cursor: "pointer" }}>
              {submitting ? "Submitting…" : "Submit for Review"}
            </button>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.4rem" }}>Headline *</label>
            <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Article headline"
              style={{ width: "100%", padding: "0.75rem 0.9rem", border: "1px solid #d1d5db", borderRadius: 6, fontSize: "1.05rem", fontWeight: 500 }} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.4rem" }}>Sub-headline</label>
            <input value={form.subtitle} onChange={e => set("subtitle", e.target.value)} placeholder="Sub-headline or deck"
              style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid #d1d5db", borderRadius: 6 }} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.4rem" }}>Summary / Excerpt</label>
            <textarea value={form.summary} onChange={e => set("summary", e.target.value)} rows={3} placeholder="Brief summary for article cards…"
              style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid #d1d5db", borderRadius: 6, resize: "vertical" }} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.4rem" }}>Content *</label>
            <RichEditor value={form.content} onChange={v => set("content", v)} />
          </div>
        </div>

        {/* Sidebar settings */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          <div style={{ background: "#fff", padding: "1.25rem", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h4 style={{ marginTop: 0, fontSize: "0.95rem" }}>Category *</h4>
            <select value={form.category_id} onChange={e => set("category_id", e.target.value)}
              style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid #d1d5db", borderRadius: 6 }}>
              <option value="">Select category…</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div style={{ background: "#fff", padding: "1.25rem", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h4 style={{ marginTop: 0, fontSize: "0.95rem" }}>Corner (optional)</h4>
            <select value={form.corner_id} onChange={e => set("corner_id", e.target.value)}
              style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid #d1d5db", borderRadius: 6 }}>
              <option value="">None</option>
              {corners.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div style={{ background: "#fff", padding: "1.25rem", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h4 style={{ marginTop: 0, fontSize: "0.95rem" }}>Language</h4>
            <select value={form.language} onChange={e => set("language", e.target.value)}
              style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid #d1d5db", borderRadius: 6 }}>
              <option value="en">English</option>
              <option value="bn">Bengali</option>
              <option value="ar">Arabic</option>
              <option value="hi">Hindi</option>
              <option value="ur">Urdu</option>
            </select>
          </div>

          <div style={{ background: "#fff", padding: "1.25rem", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            onPaste={handleImagePaste}>
            <h4 style={{ marginTop: 0, fontSize: "0.95rem" }}>Featured Image</h4>
            {form.featured_image && (
              <img src={imgUrl(form.featured_image)} alt="featured" style={{ width: "100%", borderRadius: 6, marginBottom: "0.75rem", maxHeight: 160, objectFit: "cover" }} />
            )}
            <input type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/*" onChange={handleImageUpload} style={{ display: "none" }} id="img-upload" />
            <label htmlFor="img-upload"
              onDrop={handleImageDrop}
              onDragOver={handleDragOver}
              style={{ display: "block", padding: "0.75rem", border: "2px dashed #d1d5db", borderRadius: 6, textAlign: "center", cursor: "pointer", fontSize: "0.83rem", color: "#6b7280", lineHeight: 1.6 }}>
              {uploading ? (
                "Uploading…"
              ) : (
                <>
                  <span style={{ display: "block", fontSize: "1.4rem", marginBottom: "0.2rem" }}>📷</span>
                  <strong>Click</strong>, <strong>drag & drop</strong>, or <strong>Ctrl+V</strong> to paste an image<br />
                  <span style={{ fontSize: "0.78rem", color: "#9ca3af" }}>JPG, PNG, GIF, WebP supported</span>
                </>
              )}
            </label>
            {form.featured_image && (
              <button onClick={() => set("featured_image", "")}
                style={{ marginTop: "0.5rem", background: "transparent", border: "1px solid #dc2626", color: "#dc2626", borderRadius: 4, padding: "0.25rem 0.65rem", fontSize: "0.8rem", cursor: "pointer" }}>
                Remove
              </button>
            )}
          </div>

          <div style={{ background: "#fff", padding: "1.25rem", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h4 style={{ marginTop: 0, fontSize: "0.95rem" }}>Video URL (optional)</h4>
            <input value={form.video_link} onChange={e => set("video_link", e.target.value)}
              placeholder="Paste any YouTube or Vimeo URL"
              style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid #d1d5db", borderRadius: 6, fontSize: "0.9rem" }} />
            <p style={{ fontSize: "0.78rem", color: "#9ca3af", marginTop: "0.35rem" }}>
              Paste any YouTube or Vimeo link — watch, share, live, or shorts URLs all work.
            </p>
          </div>

          <div style={{ background: "#fff", padding: "1.25rem", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h4 style={{ marginTop: 0, fontSize: "0.95rem" }}>Tags</h4>
            <div style={{ position: "relative" }}>
              <input
                value={tagInput}
                onChange={e => { setTagInput(e.target.value); searchTags(e.target.value); }}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(tagInput); } }}
                placeholder="Add tag, press Enter"
                style={{ width: "100%", padding: "0.55rem 0.75rem", border: "1px solid #d1d5db", borderRadius: 6, fontSize: "0.88rem" }}
              />
              {tagSuggestions.length > 0 && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, zIndex: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                  {tagSuggestions.map(t => (
                    <div key={t} onClick={() => addTag(t)} style={{ padding: "0.45rem 0.75rem", cursor: "pointer", fontSize: "0.88rem" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      {t}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginTop: "0.6rem" }}>
              {form.tags.map(t => (
                <span key={t} style={{ background: "#1a1a2e20", color: "#1a1a2e", padding: "0.2rem 0.55rem", borderRadius: 4, fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  {t}
                  <button onClick={() => removeTag(t)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", fontSize: "0.9rem", lineHeight: 1, padding: 0 }}>×</button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
