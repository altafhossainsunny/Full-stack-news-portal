import api from "./apiClient";

const userService = {
  list: (params = {}) => {
    const cleanParams = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v != null));
    return api.get("/api/users/", { params: cleanParams }).then(r => r.data.data || r.data);
  },
  get: (id) => api.get(`/api/users/${id}`).then(r => r.data.data || r.data),
  update: (id, data) => api.put(`/api/users/${id}`, data).then(r => r.data.data || r.data),
  suspend: (id) => api.post(`/api/users/${id}/suspend`),
  activate: (id) => api.post(`/api/users/${id}/activate`),
  delete: (id) => api.delete(`/api/users/${id}`),
};

export default userService;
