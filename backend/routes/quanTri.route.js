const express = require("express");
const router = express.Router();
const nguyenLieuController = require("../controllers/nguyenLieu.controller");
const nguoiDungController = require("../controllers/nguoiDung.controller");
const banAnController = require("../controllers/banAn.controller");
const datBanController = require("../controllers/datBan.controller");
const { checkAuth, checkRole } = require("../middlewares/checkAuth");

router.use(checkAuth, checkRole(["admin"]));

router.get("/kho", nguyenLieuController.getAll);
router.post("/kho", nguyenLieuController.create);
router.patch("/nhap-kho", nguyenLieuController.nhapKho);

router.get("/ban-an", banAnController.getAll);
router.post("/ban-an", banAnController.create);
router.delete("/ban-an/:id", banAnController.delete);

router.post("/register", nguoiDungController.dangKy);
router.get("/dat-ban", datBanController.getAll);
router.patch("/dat-ban/:id", datBanController.updateStatus);

module.exports = router;
