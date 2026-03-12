import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./styles/global.css";

// Wake up the backend on Render free tier (spins down after inactivity)
const wakeBackend = () => {
  const url = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000") + "/";
  fetch(url).catch(() => {});
};
wakeBackend();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 3, staleTime: 30000, retryDelay: 3000 },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster position="top-right" />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
