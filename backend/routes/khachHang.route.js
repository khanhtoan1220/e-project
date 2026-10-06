const express = require("express");
const router = express.Router();
const datBanController = require("../controllers/datBan.controller");
const hoTroController = require("../controllers/hoTro.controller");
const banAnController = require("../controllers/banAn.controller");
const phucVuController = require("../controllers/phucVu.controller");
const checkBanDangSuDung = require("../middlewares/checkBanDangSuDung");
const thongKeController = require("../controllers/thongKe.controller");

router.get("/mon-ban-chay", thongKeController.getMonBanChay);
router.post("/dat-ban", datBanController.khachDatBan);
router.post("/ban/:id/mo", banAnController.moBanChoKhach);
router.get("/ban/:id", banAnController.getThongTinBanChoKhach);
router.post("/ban/:id/goi-mon", checkBanDangSuDung, phucVuController.goiMon);
router.post("/goi-mon", checkBanDangSuDung, phucVuController.goiMon);
router.post("/ban/:id/ho-tro", checkBanDangSuDung, hoTroController.guiYeuCau);
router.post("/ho-tro", checkBanDangSuDung, hoTroController.guiYeuCau);
module.exports = router;
