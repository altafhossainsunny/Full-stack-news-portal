const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

function getToken() {
  return localStorage.getItem("access_token");
}

async function refreshAccessToken() {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) throw new Error("No refresh token");
  const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { Authorization: `Bearer ${refresh}`, "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Refresh failed");
  return data.data?.access_token;
}

async function request(method, path, { params, data, headers: extraHeaders = {}, _retry } = {}) {
  let url = `${BASE_URL}${path}`;
  if (params && Object.keys(params).length > 0) {
    url += "?" + new URLSearchParams(params).toString();
  }

  const isFormData = data instanceof FormData;
  const headers = { ...extraHeaders };
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  } else {
    // Let browser set Content-Type with boundary automatically
    delete headers["Content-Type"];
  }
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const init = { method, headers };
  if (data !== undefined) init.body = isFormData ? data : JSON.stringify(data);

  const res = await fetch(url, init);

  if (res.status === 401 && !_retry) {
    try {
      const newToken = await refreshAccessToken();
      if (newToken) {
        localStorage.setItem("access_token", newToken);
        return request(method, path, { params, data, headers: extraHeaders, _retry: true });
      }
    } catch {
      localStorage.clear();
      window.location.href = "/auth/login";
      throw new Error("Session expired");
    }
  }

  const json = await res.json();
  if (!res.ok) {
    const err = new Error(json?.error || json?.message || "Request failed");
    err.response = { status: res.status, data: json };
    throw err;
  }
  // Return axios-compatible shape: { data: json }
  return { data: json, status: res.status };
}

const apiClient = {
  get:    (path, options = {}) => request("GET",    path, options),
  post:   (path, body, options = {}) => request("POST",   path, { ...options, data: body }),
  put:    (path, body, options = {}) => request("PUT",    path, { ...options, data: body }),
  patch:  (path, body, options = {}) => request("PATCH",  path, { ...options, data: body }),
  delete: (path, options = {}) => request("DELETE", path, options),
};

export default apiClient;
