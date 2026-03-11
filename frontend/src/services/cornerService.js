import api from "./apiClient";

const cornerService = {
  list: (params) => api.get("/api/corners/", { params }).then(r => r.data.data || r.data),
  get: (id) => api.get(`/api/corners/${id}`).then(r => r.data.data || r.data),
  create: (data) => api.post("/api/corners/", data).then(r => r.data.data || r.data),
  update: (id, data) => api.put(`/api/corners/${id}`, data).then(r => r.data.data || r.data),
  delete: (id) => api.delete(`/api/corners/${id}`).then(r => r.data.data || r.data),
};

export default cornerService;
