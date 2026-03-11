import api from "./apiClient";

const mediaService = {
  upload: (file, folder = "articles", altText = "") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    if (altText) formData.append("alt_text", altText);
    return api.post("/api/media/upload", formData).then(r => r.data.data || r.data);
  },
  listByFolder: (folder) => api.get("/api/media/", { params: { folder } }).then(r => r.data.data || r.data),
  list: (folder, params) => api.get("/api/media/", { params: { folder, ...params } }).then(r => r.data.data || r.data),
  delete: (id) => api.delete(`/api/media/${id}`),
};

export default mediaService;
