import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import publicService from "../../services/publicService";
import { Link } from "react-router-dom";
import { formatDate } from "../../utils/formatDate";
import { truncateText } from "../../utils/truncateText";
import { usePagination } from "../../hooks/usePagination";

export default function CategoryPage() {
  const { slug } = useParams();
  const { page, nextPage, prevPage } = usePagination(12);
  const { data, isLoading } = useQuery(
    ["category", slug, page],
    () => publicService.categoryArticles(slug, { page, per_page: 12 })
  );

  const result = data?.data?.data || {};
  const category = result.category;
  const articles = result.articles || [];

  if (isLoading) return <div style={{ padding: "2rem", textAlign: "center" }}>Loading…</div>;

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      {category && (
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.8rem" }}>{category.name}</h1>
          {category.description && (
            <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>{category.description}</p>
          )}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
        {articles.map(article => (
          <div key={article.id} style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
            {article.featured_image && (
              <img src={article.featured_image} alt={article.title}
                style={{ width: "100%", height: 180, objectFit: "cover" }} />
            )}
            <div style={{ padding: "1rem" }}>
              <Link to={`/articles/${article.slug}`}>
                <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>{article.title}</h2>
              </Link>
              <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>{truncateText(article.summary, 100)}</p>
              <p style={{ color: "#9ca3af", fontSize: "0.78rem", marginTop: "0.5rem" }}>
                {formatDate(article.publish_date)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
        {page > 1 && <button onClick={prevPage}>← Previous</button>}
        {articles.length === 12 && <button onClick={nextPage}>Next →</button>}
      </div>
    </div>
  );
}
