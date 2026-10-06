const express = require("express");
const router = express.Router();
const nguoiDungController = require("../controllers/nguoiDung.controller");
const { checkAuth, checkRole } = require("../middlewares/checkAuth");

router.post("/login", nguoiDungController.dangNhap);
router.get("/me", checkAuth, nguoiDungController.getProfile);
router.patch("/doi-mat-khau", checkAuth, nguoiDungController.doiMatKhau);

router.post(
  "/register",
  // checkAuth,
  // checkRole(["admin"]),
  nguoiDungController.dangKy,
);
router.post("/logout", checkAuth, nguoiDungController.dangXuat);

module.exports = router;
