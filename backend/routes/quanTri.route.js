const express = require("express");
const router = express.Router();
const nguyenLieuController = require("../controllers/nguyenLieu.controller");
const nguoiDungController = require("../controllers/nguoiDung.controller");
const banAnController = require("../controllers/banAn.controller");
const datBanController = require("../controllers/datBan.controller");
const { checkAuth, checkRole } = require("../middlewares/checkAuth");
const thongKeController = require("../controllers/thongKe.controller");
const hoaDonController = require("../controllers/hoaDon.controller");

router.use(checkAuth, checkRole(["admin"]));

router.get("/kho", nguyenLieuController.getAll);
router.post("/kho", nguyenLieuController.create);
router.put("/kho/:id", nguyenLieuController.update);
router.delete("/kho/:id", nguyenLieuController.delete);
router.patch("/nhap-kho", nguyenLieuController.nhapKho);

router.get("/ban-an", banAnController.getAll);
router.post("/ban-an", banAnController.create);
router.delete("/ban-an/:id", banAnController.delete);
router.get("/nhan-vien", nguoiDungController.getAllNhanVien);
router.post("/nhan-vien", nguoiDungController.dangKy);
router.delete("/nhan-vien/:id", nguoiDungController.xoaNhanVien);
router.patch("/nhan-vien/:id/reset-mat-khau", nguoiDungController.resetMatKhau);
router.post("/register", nguoiDungController.dangKy);

router.get("/dat-ban", datBanController.getAll);
router.patch("/dat-ban/:id", datBanController.updateStatus);

// Quản lý hóa đơn
router.get("/hoa-don", hoaDonController.getAll);
router.get("/hoa-don/:id", hoaDonController.getDetail);
router.patch("/hoa-don/:id/huy", hoaDonController.huyHoaDon);
router.get("/thong-ke/doanh-thu", thongKeController.getDoanhThu);
router.get("/thong-ke/mon-ban-chay", thongKeController.getMonBanChay);
router.get("/thong-ke/ton-kho-thap", thongKeController.getTonKhoThap);

module.exports = router;
