import api from "./apiClient";

const adService = {
  list: (params) => api.get("/api/ads/", { params }).then(r => r.data.data || r.data),
  get: (id) => api.get(`/api/ads/${id}`).then(r => r.data.data || r.data),
  create: (data) => api.post("/api/ads/", data).then(r => r.data.data || r.data),
  update: (id, data) => api.put(`/api/ads/${id}`, data).then(r => r.data.data || r.data),
  delete: (id) => api.delete(`/api/ads/${id}`),
  trackClick: (id) => api.post(`/api/ads/${id}/click`),
  trackImpression: (id) => api.post(`/api/ads/${id}/impression`),
};

export default adService;
