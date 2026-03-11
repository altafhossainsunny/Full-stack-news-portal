import api from "./apiClient";

const tagService = {
  list: () => api.get("/api/tags").then(r => r.data.data || r.data),
  search: (q) => api.get("/api/tags/search", { params: { q } }).then(r => r.data.data || r.data),
};

export default tagService;
