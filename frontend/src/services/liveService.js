import api from "./apiClient";

const liveService = {
  startStream: (data) => api.post("/api/live/streams", data).then(r => r.data.data || r.data),
  endStream: (id) => api.post(`/api/live/streams/${id}/end`),
  activeStream: () => api.get("/api/live/streams/active").then(r => r.data.data || r.data),
  listStreams: () => api.get("/api/live/streams").then(r => r.data.data || r.data),
  addUpdate: (streamId, data) => api.post("/api/live/updates", { ...data, stream_id: streamId }),
  getUpdates: (streamId) => api.get("/api/live/updates", { params: { stream_id: streamId } }).then(r => r.data.data || r.data),
};

export default liveService;
