import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8080/api", // back-end Spring Boot
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
