const express = require("express");
const router = express.Router();
const datBanController = require("../controllers/datBan.controller");
const hoTroController = require("../controllers/hoTro.controller");
const banAnController = require("../controllers/banAn.controller");

const checkQr = require("../middlewares/checkQr");
const phucVuController = require("../controllers/phucVu.controller");

router.get("/hoa-don", checkQr, (req, res) => res.json(req.hoaDonKhach));
router.post("/goi-mon", checkQr, phucVuController.goiMon);
router.post("/dat-ban", datBanController.khachDatBan);
router.post("/ho-tro", checkQr, hoTroController.guiYeuCau);
router.get("/ban/:id", checkQr, banAnController.getThongTinBanChoKhach);

module.exports = router;
