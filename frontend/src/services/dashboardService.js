import api from "./apiClient";

const dashboardService = {
  ownerStats: () => api.get("/api/dashboard/owner").then(r => r.data.data),
  publisherStats: () => api.get("/api/dashboard/publisher").then(r => r.data.data),
  editorStats: () => api.get("/api/dashboard/editor").then(r => r.data.data),
  reporterStats: () => api.get("/api/dashboard/reporter").then(r => r.data.data),
  activityLogs: (params = {}) => api.get("/api/dashboard/activity-logs", { params }).then(r => r.data.data),
};

export default dashboardService;
