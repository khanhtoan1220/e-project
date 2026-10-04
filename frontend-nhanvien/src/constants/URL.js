const URL = {
  // Auth
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  ME: "/auth/me",
  DOI_MAT_KHAU: "/auth/doi-mat-khau",

  // Phục vụ
  PHUC_VU_SO_DO: "/phuc-vu/so-do-ban",
  PHUC_VU_MO_BAN: "/phuc-vu/mo-ban",
  PHUC_VU_GOI_MON: "/phuc-vu/goi-mon",
  PHUC_VU_THANH_TOAN: "/phuc-vu/thanh-toan",
  PHUC_VU_DON_BAN: (id) => `/phuc-vu/don-ban/${id}`,
  PHUC_VU_CHUYEN_BAN: "/phuc-vu/chuyen-ban",
  PHUC_VU_BUNG_MON: "/phuc-vu/cap-nhat-bung-mon",
  PHUC_VU_DUYET_MON: "/phuc-vu/duyet-mon",
  HOA_DON_BAN: (id) => `/phuc-vu/hoa-don-ban/${id}`,
  DANH_SACH_HO_TRO: "/phuc-vu/danh-sach-ho-tro",
  XAC_NHAN_HO_TRO: (id) => `/phuc-vu/xac-nhan-ho-tro/${id}`,

  // Nhà bếp
  BEP_MON_CHO: "/nha-bep/mon-cho",
  BEP_CAP_NHAT_MON: "/nha-bep/cap-nhat-mon",

  // Thực đơn (dùng để chọn món)
  DANH_MUC: "/thuc-don/danh-muc",
  MON_AN: "/thuc-don/mon-an",
};

export default URL;
