const express = require("express");
const router = express.Router();
const danhmucController = require("../controllers/danhmuc.controller");
const menuController = require("../controllers/menu.controller");
const { checkAuth, checkRole } = require("../middlewares/checkAuth");

// --- API CÔNG KHAI ---
router.get("/danh-muc", danhmucController.getAll);
router.get("/mon-an", menuController.getAll);
router.get("/mon-an/:id", menuController.getDetail);

// --- API QUẢN LÝ DANH MỤC (Chỉ Admin) ---
router.post(
  "/danh-muc",
  checkAuth,
  checkRole(["admin"]),
  danhmucController.create,
);
router.put(
  "/danh-muc/:id",
  checkAuth,
  checkRole(["admin"]),
  danhmucController.update,
);
router.delete(
  "/danh-muc/:id",
  checkAuth,
  checkRole(["admin"]),
  danhmucController.delete,
);

// --- API QUẢN LÝ MÓN ĂN (Chỉ Admin) ---
router.post("/mon-an", checkAuth, checkRole(["admin"]), menuController.create);

// Sửa thông tin món ăn (Tên, giá, ảnh...)
router.put(
  "/mon-an/:id",
  checkAuth,
  checkRole(["admin"]),
  menuController.update,
);

// Xóa món ăn
router.delete(
  "/mon-an/:id",
  checkAuth,
  checkRole(["admin"]),
  menuController.delete,
);

// Cập nhật trạng thái Còn/Hết món
router.patch(
  "/mon-an/:id/status",
  checkAuth,
  checkRole(["admin"]),
  menuController.updateStatus,
);

module.exports = router;
