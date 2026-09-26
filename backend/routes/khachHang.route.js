const express = require("express");
const router = express.Router();
const datBanController = require("../controllers/datBan.controller");
const hoTroController = require("../controllers/hoTro.controller");

router.post("/dat-ban", datBanController.khachDatBan);
router.post("/ho-tro", hoTroController.guiYeuCau);

module.exports = router;
