import axios from "axios";
import ENV from "../constants/ENV";

const apiClient = axios.create({
  baseURL: ENV.api_url,
  timeout: 10000,
  withCredentials: true, // Lưu trữ cookie session connect.sid
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor để xử lý lỗi phiên 401 tập trung
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("staff_user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
