import api from "./apiClient";

const API = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

const authService = {
  login: async (email, password) => {
    const res = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw { response: { data } };
    return data;
  },
  me: async () => {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${API}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data.data || data;
  },
  refresh: () => api.post("/api/auth/refresh"),
  logout: () => api.post("/api/auth/logout"),
};

export default authService;
