import apiClient from "../utils/api";
import URL from "../constants/URL";

// --- AUTHENTICATION ---
export const login_service = async (tenDangNhap, matKhau) => {
  try {
    const res = await apiClient.post(URL.LOGIN, { tenDangNhap, matKhau });
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Đăng nhập thất bại";
  }
};

export const logout_service = async () => {
  try {
    const res = await apiClient.post(URL.LOGOUT);
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Đăng xuất thất bại";
  }
};

export const get_me_service = async () => {
  try {
    const res = await apiClient.get(URL.ME);
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Lỗi xác thực phiên làm việc";
  }
};

export const doi_matkhau_service = async (matKhauCu, matKhauMoi) => {
  try {
    const res = await apiClient.patch(URL.DOI_MAT_KHAU, {
      matKhauCu,
      matKhauMoi,
    });
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Đổi mật khẩu thất bại";
  }
};

// --- PHỤC VỤ (SO ĐỒ BÀN & HOÁ ĐƠN) ---
export const get_sodoban_service = async () => {
  try {
    const res = await apiClient.get(URL.PHUC_VU_SO_DO);
    return res.data || [];
  } catch (error) {
    throw error.response?.data?.message || "Lỗi lấy sơ đồ bàn";
  }
};

export const mo_ban_service = async (banId) => {
  try {
    const res = await apiClient.post(URL.PHUC_VU_MO_BAN, { banId });
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Mở bàn thất bại";
  }
};

export const get_hoadon_ban_service = async (banId) => {
  try {
    const res = await apiClient.get(URL.HOA_DON_BAN(banId));
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Không có hóa đơn chưa thanh toán";
  }
};

export const goi_mon_service = async (hoaDonId, chonMon) => {
  try {
    const res = await apiClient.post(URL.PHUC_VU_GOI_MON, {
      hoaDonId,
      chonMon,
    });
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Gọi món thất bại";
  }
};

export const thanh_toan_service = async (hoaDonId) => {
  try {
    const res = await apiClient.post(URL.PHUC_VU_THANH_TOAN, { hoaDonId });
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Thanh toán thất bại";
  }
};

export const don_ban_service = async (banId) => {
  try {
    const res = await apiClient.patch(URL.PHUC_VU_DON_BAN(banId));
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Dọn bàn thất bại";
  }
};

export const chuyen_ban_service = async (banCuId, banMoiId) => {
  try {
    const res = await apiClient.post(URL.PHUC_VU_CHUYEN_BAN, {
      banCuId,
      banMoiId,
    });
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Chuyển bàn thất bại";
  }
};

export const bung_mon_service = async (hoaDonId, monItemObjectId) => {
  try {
    const res = await apiClient.patch(URL.PHUC_VU_BUNG_MON, {
      hoaDonId,
      monItemObjectId,
    });
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Xác nhận bưng món thất bại";
  }
};

export const duyet_mon_service = async (hoaDonId) => {
  try {
    const res = await apiClient.post(URL.PHUC_VU_DUYET_MON, { hoaDonId });
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Xác nhận duyệt món thất bại";
  }
};

// Chuông hỗ trợ phục vụ
export const get_danhsach_hotro_service = async () => {
  try {
    const res = await apiClient.get(URL.DANH_SACH_HO_TRO);
    return res.data || [];
  } catch (error) {
    throw error.response?.data?.message || "Lỗi lấy danh sách hỗ trợ";
  }
};

export const xac_nhan_hotro_service = async (id) => {
  try {
    const res = await apiClient.patch(URL.XAC_NHAN_HO_TRO(id));
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Xác nhận hỗ trợ thất bại";
  }
};

// --- NHÀ BẾP ---
export const get_bep_moncho_service = async () => {
  try {
    const res = await apiClient.get(URL.BEP_MON_CHO);
    return res.data || [];
  } catch (error) {
    throw error.response?.data?.message || "Lỗi lấy danh sách món chờ";
  }
};

export const bep_capnhat_mon_service = async (
  hoaDonId,
  monItemObjectId,
  trangThaiMoi,
) => {
  try {
    const res = await apiClient.patch(URL.BEP_CAP_NHAT_MON, {
      hoaDonId,
      monItemObjectId,
      trangThaiMoi,
    });
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Cập nhật trạng thái món thất bại";
  }
};

// --- THỰC ĐƠN ---
export const get_danhmuc_menu_service = async () => {
  try {
    const res = await apiClient.get(URL.DANH_MUC);
    return res.data || [];
  } catch (error) {
    throw error.response?.data?.message || "Lỗi lấy danh mục thực đơn";
  }
};

export const get_monan_menu_service = async (danhMucId = "") => {
  try {
    const params = { conBan: "true" };
    if (danhMucId) params.danhMuc = danhMucId;
    const res = await apiClient.get(URL.MON_AN, { params });
    return res.data || [];
  } catch (error) {
    throw error.response?.data?.message || "Lỗi lấy danh sách món ăn";
  }
};

export const tao_qr_service = async (hoaDonId) => {
  try {
    const res = await apiClient.post("/phuc-vu/hoa-don/" + hoaDonId + "/qr");
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Không tạo được QR.";
  }
};
