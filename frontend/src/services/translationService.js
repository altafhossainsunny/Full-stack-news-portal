import api from "./apiClient";

const translationService = {
  translateText: (data) => api.post("/api/translations/translate", data).then(r => r.data.data || r.data),
  transcribeAudio: (formData) =>
    api.post("/api/translations/transcribe", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(r => r.data.data || r.data),
  // legacy aliases
  translate: (text, sourceLang) =>
    api.post("/api/translations/translate", { text, source_lang: sourceLang }).then(r => r.data.data || r.data),
};

export default translationService;
