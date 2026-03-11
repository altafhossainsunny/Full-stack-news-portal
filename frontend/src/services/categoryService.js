import api from "./apiClient";

const categoryService = {
  // Public — no auth required, used by Header nav
  listPublic: () => api.get("/api/public/categories").then(r => r.data.data || r.data),
  list: (params) => api.get("/api/categories/", { params }).then(r => r.data.data || r.data),
  get: (id) => api.get(`/api/categories/${id}`).then(r => r.data.data || r.data),
  create: (data) => api.post("/api/categories/", data).then(r => r.data.data || r.data),
  update: (id, data) => api.put(`/api/categories/${id}`, data).then(r => r.data.data || r.data),
  delete: (id) => api.delete(`/api/categories/${id}`).then(r => r.data.data || r.data),
};

export default categoryService;
