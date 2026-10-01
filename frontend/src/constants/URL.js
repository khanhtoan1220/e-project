const URL = {
  // Auth routes
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  ME: "/auth/me",

  // Quản lý người dùng/nhân viên (cho Admin)
  NHAN_VIEN: "/quan-tri/nhan-vien",
  DANG_KY_NHAN_VIEN: "/quan-tri/register",

  // Quản lý thực đơn
  DANH_MUC: "/thuc-don/danh-muc",
  MON_AN: "/thuc-don/mon-an",
  MON_AN_STATUS: (id) => `/thuc-don/mon-an/${id}/status`,
  MON_AN_DETAIL: (id) => `/thuc-don/mon-an/${id}`,

  // Quản lý kho nguyên liệu
  KHO: "/quan-tri/kho",
BAN_AN: "/quan-tri/ban-an",
DAT_BAN: "/quan-tri/dat-ban",
HOA_DON: "/quan-tri/hoa-don"

  
};

export default URL;