import api from "./apiClient";

const articleService = {
  create: (data) => api.post("/api/articles/", data).then(r => r.data.data || r.data),
  list: (params) => api.get("/api/articles/", { params }).then(r => ({ articles: r.data.data || [], total: r.data.pagination?.total || 0 })),
  listByStatus: (status, params = {}) => api.get("/api/articles/", { params: { ...params, status } }).then(r => ({ articles: r.data.data || [], total: r.data.pagination?.total || 0 })),
  myArticles: (params = {}) => api.get("/api/articles/my", { params }).then(r => ({ articles: r.data.data || [], total: r.data.pagination?.total || 0 })),
  get: (id) => api.get(`/api/articles/${id}`).then(r => r.data.data || r.data),
  update: (id, data) => api.put(`/api/articles/${id}`, data).then(r => r.data.data || r.data),
  delete: (id) => api.delete(`/api/articles/${id}`),
  submit: (id) => api.post(`/api/articles/${id}/submit`),
  approve: (id) => api.post(`/api/articles/${id}/review`, { action: "approve" }),
  reject: (id, data) => api.post(`/api/articles/${id}/review`, { action: "reject", ...data }),
  returnToEditor: (id, data) => api.post(`/api/articles/${id}/review`, { action: "return", ...data }),
  publish: (id) => api.post(`/api/articles/${id}/publish`),
  unpublish: (id) => api.post(`/api/articles/${id}/unpublish`),
  setBreaking: (id, value) => api.post(`/api/articles/${id}/breaking`, { value }),
  setFeatured: (id, value) => api.post(`/api/articles/${id}/featured`, { value }),
  setEditorsPick: (id, value) => api.post(`/api/articles/${id}/editors-pick`, { value }),  schedule:      (id, scheduledAt) => api.post(`/api/articles/${id}/schedule`, { scheduled_at: scheduledAt }).then(r => r.data),
  processScheduled: ()            => api.get("/api/articles/process-scheduled").then(r => r.data),};

export default articleService;
