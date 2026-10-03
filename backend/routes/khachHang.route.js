const express = require("express");
const router = express.Router();
const datBanController = require("../controllers/datBan.controller");
const hoTroController = require("../controllers/hoTro.controller");
const banAnController = require("../controllers/banAn.controller");

router.post("/dat-ban", datBanController.khachDatBan);
router.post("/ho-tro", hoTroController.guiYeuCau);
router.get("/ban/:id", banAnController.getThongTinBanChoKhach);

module.exports = router;
