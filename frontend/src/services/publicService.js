import api from "./apiClient";

const publicService = {
  homepage: () => api.get("/api/public/homepage"),
  articleDetail: (slug) => api.get(`/api/public/articles/${slug}`),
  categoryArticles: (slug, params) => api.get(`/api/public/categories/${slug}/articles`, { params }),
  cornerArticles: (slug, params) => api.get(`/api/public/corners/${slug}/articles`, { params }),
  search: (q, params) => api.get("/api/public/search", { params: { q, ...params } }),
  trending: (limit) => api.get("/api/public/trending", { params: { limit } }),
  breaking: () => api.get("/api/public/breaking"),
  live: () => api.get("/api/public/live"),
  ads: (placement) => api.get("/api/public/ads", { params: placement ? { placement } : {} }),
  subscribe: (email) => api.post("/api/public/newsletter/subscribe", { email }),
};

export default publicService;
