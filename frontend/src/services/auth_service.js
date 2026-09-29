import URL from "../constants/URL";
import apiClient from "../utils/api";

export const login_service = async (tenDangNhap, matKhau) => {
  try {
    const res = await apiClient.post(URL.LOGIN, { tenDangNhap, matKhau });
    if (res.data && res.data.user) {
      localStorage.setItem("user", JSON.stringify(res.data.user));
      return res.data.user;
    }
    throw new Error("Dữ liệu phản hồi từ máy chủ không hợp lệ");
  } catch (error) {
    throw error.response?.data?.message || error.message || "Đăng nhập thất bại!";
  }
};

export const logout_service = async () => {
  try {
    await apiClient.post(URL.LOGOUT);
  } catch (error) {
    console.error("Lỗi gọi API đăng xuất:", error);
  } finally {
    localStorage.removeItem("user");
  }
};

export const get_profile_service = async () => {
  try {
    const res = await apiClient.get(URL.ME);
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Không thể lấy thông tin phiên làm việc";
  }
};