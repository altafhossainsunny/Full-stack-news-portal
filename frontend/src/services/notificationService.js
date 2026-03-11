import api from "./apiClient";

const notificationService = {
  list: (params) => api.get("/api/notifications/", { params }).then(r => r.data.data || r.data),
  markRead: (id) => api.post(`/api/notifications/${id}/read`),
  markAllRead: () => api.post("/api/notifications/read-all"),
  unreadCount: () => api.get("/api/notifications/unread-count"),
  unreadCountRaw: () => api.get("/api/notifications/unread-count").then(r => r.data.data?.count || 0),
};

export default notificationService;
