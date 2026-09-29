const express = require("express");
const router = express.Router();
const phucVuController = require("../controllers/phucVu.controller");
const { checkAuth, checkRole } = require("../middlewares/checkAuth");
const hoTroController = require("../controllers/hoTro.controller");

router.post("/goi-mon", phucVuController.goiMon);

router.get(
  "/so-do-ban",
  checkAuth,
  checkRole(["admin", "phucVu"]),
  phucVuController.laySoDoBan,
);
router.post(
  "/mo-ban",
  checkAuth,
  checkRole(["admin", "phucVu"]),
  phucVuController.moBan,
);
router.get(
  "/hoa-don-ban/:id",
  checkAuth,
  checkRole(["admin", "phucVu"]),
  phucVuController.getHoaDonTheoBan,
);
router.post(
  "/thanh-toan",
  checkAuth,
  checkRole(["admin", "phucVu"]),
  phucVuController.thanhToan,
);
router.get(
  "/danh-sach-ho-tro",
  checkAuth,
  checkRole(["admin", "phucVu"]),
  hoTroController.getDanhSachCho,
);
router.patch(
  "/xac-nhan-ho-tro/:id",
  checkAuth,
  checkRole(["admin", "phucVu"]),
  hoTroController.hoanTatYeuCau,
);
router.patch(
  "/don-ban/:id",
  checkAuth,
  checkRole(["admin", "phucVu"]),
  phucVuController.hoanTatDonBan,
);
router.post(
  "/chuyen-ban",
  checkAuth,
  checkRole(["admin", "phucVu"]),
  phucVuController.chuyenBan,
);

module.exports = router;
