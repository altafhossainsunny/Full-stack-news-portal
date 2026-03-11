import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import publicService from "../../services/publicService";
import { formatDate } from "../../utils/formatDate";
import { Link } from "react-router-dom";
import { imgUrl, fixContentImages, toEmbedUrl } from "../../utils/imageUrl";
import { AdBanner } from "../../components/public/SponsoredSection";

export default function ArticleDetailsPage() {
  const { slug } = useParams();
  const { data, isLoading, error } = useQuery(["article", slug], () => publicService.articleDetail(slug));

  if (isLoading) return <div style={{ padding: "2rem", textAlign: "center" }}>Loading…</div>;
  if (error) return <div style={{ padding: "2rem", textAlign: "center", color: "#dc2626" }}>Article not found.</div>;

  const { article, related } = data?.data?.data || {};
  if (!article) return null;

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem", maxWidth: 900, margin: "0 auto" }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "1rem" }}>
        <Link to="/">Home</Link> {" / "}
        {article.category_id && <span>Category</span>}
      </div>

      {/* Badges */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
        {article.is_breaking && (
          <span style={{ background: "#e94560", color: "#fff", padding: "0.2rem 0.6rem", borderRadius: 4, fontSize: "0.75rem" }}>BREAKING</span>
        )}
        {article.is_sponsored && (
          <span style={{ background: "#d97706", color: "#fff", padding: "0.2rem 0.6rem", borderRadius: 4, fontSize: "0.75rem" }}>
            {article.sponsored_label || "SPONSORED"}
          </span>
        )}
      </div>

      <h1 style={{ fontSize: "2rem", lineHeight: 1.3, marginBottom: "0.75rem" }}>{article.title}</h1>
      {article.subtitle && (
        <h2 style={{ fontSize: "1.1rem", color: "#4b5563", fontWeight: 400, marginBottom: "1rem" }}>{article.subtitle}</h2>
      )}

      <div style={{ display: "flex", gap: "1rem", color: "#6b7280", fontSize: "0.85rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <span>{formatDate(article.publish_date)}</span>
        <span>·</span>
        <span>{article.view_count} views</span>
      </div>

      {/* Featured Image */}
      {article.featured_image && (
        <img src={imgUrl(article.featured_image)} alt={article.title}
          style={{ width: "100%", maxHeight: 480, objectFit: "cover", borderRadius: 8, marginBottom: "2rem" }} />
      )}

      {/* Article Body */}
      <div
        style={{ fontSize: "1.05rem", lineHeight: 1.8, fontFamily: "Georgia, serif" }}
        dangerouslySetInnerHTML={{ __html: fixContentImages(article.content) }}
      />

      {/* Tags */}
      {article.tags?.length > 0 && (
        <div style={{ marginTop: "2rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {article.tags.map(tag => (
            <Link key={tag} to={`/search?q=${tag}`} style={{
              background: "#f3f4f6", padding: "0.25rem 0.75rem",
              borderRadius: 9999, fontSize: "0.85rem", color: "#374151",
            }}>
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {/* Video */}
      {article.video_link && (
        <div style={{ marginTop: "2rem" }}>
          <h3 style={{ marginBottom: "0.75rem" }}>Video</h3>
          <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
            <iframe
              src={toEmbedUrl(article.video_link)}
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none", borderRadius: 8 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title="Article Video"
            />
          </div>
        </div>
      )}

      {/* Related Articles */}
      <AdBanner placement="article_page_banner" />
      {related?.length > 0 && (
        <section style={{ marginTop: "3rem" }}>
          <h3 style={{ fontSize: "1.2rem", marginBottom: "1rem", borderBottom: "2px solid #e94560", paddingBottom: "0.5rem" }}>
            Related Articles
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
            {related.map(a => (
              <div key={a.id}>
                {a.featured_image && (
                  <img src={imgUrl(a.featured_image)} alt={a.title}
                    style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 4, marginBottom: "0.5rem" }} />
                )}
                <Link to={`/articles/${a.slug}`} style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                  {a.title}
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
