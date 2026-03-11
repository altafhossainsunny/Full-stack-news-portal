import api from "./apiClient";

const invitationService = {
  send: (data) => api.post("/api/invitations/send", data),
  list: (params) => api.get("/api/invitations/", { params }).then(r => r.data.data || r.data),
  revoke: (id) => api.post(`/api/invitations/${id}/revoke`),
  verify: (token) => api.get(`/api/invitations/verify/${token}`).then(r => r.data.data || r.data),
  accept: (payload) => api.post("/api/invitations/accept", payload),
};

export default invitationService;
