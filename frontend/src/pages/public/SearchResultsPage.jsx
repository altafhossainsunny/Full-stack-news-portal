import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "react-query";
import publicService from "../../services/publicService";
import { useDebounce } from "../../hooks/useDebounce";
import { formatDate } from "../../utils/formatDate";

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const debouncedQ = useDebounce(q, 400);

  const { data, isLoading } = useQuery(
    ["search", debouncedQ],
    () => publicService.search(debouncedQ),
    { enabled: debouncedQ.length > 1 }
  );

  const results = data?.data?.data?.results || [];

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Search</h1>
      <input
        type="search"
        value={q}
        onChange={e => setSearchParams({ q: e.target.value })}
        placeholder="Search articles…"
        style={{
          width: "100%", padding: "0.75rem 1rem", fontSize: "1rem",
          border: "2px solid #e5e7eb", borderRadius: 8, marginBottom: "1.5rem",
        }}
      />

      {isLoading && <p style={{ color: "#6b7280" }}>Searching…</p>}

      {!isLoading && debouncedQ.length > 1 && (
        <p style={{ color: "#6b7280", marginBottom: "1rem" }}>
          {results.length} result{results.length !== 1 ? "s" : ""} for "{debouncedQ}"
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {results.map(article => (
          <div key={article.id} style={{ display: "flex", gap: "1rem", borderBottom: "1px solid #e5e7eb", paddingBottom: "1.25rem" }}>
            {article.featured_image && (
              <img src={article.featured_image} alt={article.title}
                style={{ width: 120, height: 80, objectFit: "cover", borderRadius: 4, flexShrink: 0 }} />
            )}
            <div>
              <Link to={`/articles/${article.slug}`}>
                <h3 style={{ fontSize: "1rem", marginBottom: "0.25rem" }}>{article.title}</h3>
              </Link>
              <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>{article.summary}</p>
              <p style={{ color: "#9ca3af", fontSize: "0.78rem", marginTop: "0.25rem" }}>
                {formatDate(article.publish_date)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
