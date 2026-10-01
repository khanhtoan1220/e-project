import URL from "../constants/URL";
import apiClient from "../utils/api";

// --- QUẢN LÝ NHÂN VIÊN ---

export const get_nhanvien_service = async (search = "", vaiTro = "") => {
  try {
    const params = {};
    if (search) params.search = search;
    if (vaiTro) params.vaiTro = vaiTro;
    const res = await apiClient.get(URL.NHAN_VIEN, { params });
    return res.data || [];
  } catch (error) {
    throw error.response?.data?.message || "Lỗi lấy danh sách nhân viên";
  }
};

export const create_nhanvien_service = async (hoTen, tenDangNhap, matKhau, vaiTro) => {
  try {
    const res = await apiClient.post(URL.DANG_KY_NHAN_VIEN, { hoTen, tenDangNhap, matKhau, vaiTro });
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Tạo tài khoản nhân viên thất bại";
  }
};

export const delete_nhanvien_service = async (id) => {
  try {
    const res = await apiClient.delete(`${URL.NHAN_VIEN}/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Xóa nhân viên thất bại";
  }
};

export const reset_matkhau_service = async (id, matKhauMoi) => {
  try {
    const res = await apiClient.patch(`${URL.NHAN_VIEN}/${id}/reset-mat-khau`, { matKhauMoi });
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Đặt lại mật khẩu thất bại";
  }
};

// --- QUẢN LÝ THỰC ĐƠN (DANH MỤC & MÓN ĂN) ---

export const get_danhmuc_service = async () => {
  try {
    const res = await apiClient.get(URL.DANH_MUC);
    return res.data || [];
  } catch (error) {
    throw error.response?.data?.message || "Lỗi lấy danh sách danh mục";
  }
};

export const create_danhmuc_service = async (data) => {
  try {
    const res = await apiClient.post(URL.DANH_MUC, data);
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Thêm danh mục thất bại";
  }
};

export const update_danhmuc_service = async (id, data) => {
  try {
    const res = await apiClient.put(`${URL.DANH_MUC}/${id}`, data);
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Cập nhật danh mục thất bại";
  }
};

export const delete_danhmuc_service = async (id) => {
  try {
    const res = await apiClient.delete(`${URL.DANH_MUC}/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Xóa danh mục thất bại";
  }
};

// Món ăn
export const get_monan_service = async (filters = {}) => {
  try {
    const res = await apiClient.get(URL.MON_AN, { params: filters });
    // API có phân trang nếu có tham số 'page', ngược lại trả về mảng trực tiếp
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Lỗi lấy danh sách món ăn";
  }
};

export const create_monan_service = async (data) => {
  try {
    const res = await apiClient.post(URL.MON_AN, data);
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Thêm món ăn thất bại";
  }
};

export const update_monan_service = async (id, data) => {
  try {
    const res = await apiClient.put(`${URL.MON_AN}/${id}`, data);
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Cập nhật món ăn thất bại";
  }
};

export const delete_monan_service = async (id) => {
  try {
    const res = await apiClient.delete(`${URL.MON_AN}/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Xóa món ăn thất bại";
  }
};

export const update_status_monan_service = async (id, conBan) => {
  try {
    const res = await apiClient.patch(URL.MON_AN_STATUS(id), { conBan });
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Cập nhật trạng thái bán thất bại";
  }
};