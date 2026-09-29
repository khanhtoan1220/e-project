import axios from "axios";
import ENV from "../constants/ENV";

const apiClient = axios.create({
  baseURL: ENV.api_url,
  timeout: 10000,
  withCredentials: true, // Rất quan trọng vì backend sử dụng express-session để lưu session người dùng qua cookie
  headers: {
    "Content-Type": "application/json"
  }
});

// Response interceptor để xử lý lỗi tập trung
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Nếu lỗi 401 (Chưa đăng nhập / Hết hạn phiên), xóa dữ liệu lưu trữ local và chuyển về trang login
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;