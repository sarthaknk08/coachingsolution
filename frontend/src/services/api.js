import axios from "axios";

const API = axios.create({
  baseURL: "https://coachingcms.vercel.app/",
});

// Attach token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Log response errors
API.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API Error:", {
      status: err.response?.status,
      message: err.response?.data?.message,
      data: err.response?.data,
      url: err.config?.url,
    });
    return Promise.reject(err);
  }
);

export default API;
