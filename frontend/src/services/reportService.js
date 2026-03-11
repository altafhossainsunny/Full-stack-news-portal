import api from "./apiClient";

const reportService = {
  submit: (formData) =>
    api.post("/api/reports/", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  myReports: (params = {}) => api.get("/api/reports/my", { params }).then(r => ({ reports: r.data.data || [], total: r.data.pagination?.total || 0 })),
  list: (params) => api.get("/api/reports/", { params }).then(r => r.data.data || r.data),
  get: (id) => api.get(`/api/reports/${id}`).then(r => r.data.data || r.data),
  updateStatus: (id, data) => api.put(`/api/reports/${id}/status`, data),
  delete: (id) => api.delete(`/api/reports/${id}`),
};

export default reportService;
