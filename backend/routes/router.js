const express = require("express");
const router = express.Router();

const authRoute = require("./auth.route");
const thucDonRoute = require("./thucDon.route");
const phucVuRoute = require("./phucVu.route");
const nhaBepRoute = require("./nhaBep.route");
const quanTriRoute = require("./quanTri.route");
const khachHangRoute = require("./khachHang.route");
const fileRouter = require("./file.route");

router.use("/auth", authRoute);
router.use("/thuc-don", thucDonRoute);
router.use("/phuc-vu", phucVuRoute);
router.use("/nha-bep", nhaBepRoute);
router.use("/quan-tri", quanTriRoute);
router.use("/khach-hang", khachHangRoute);
router.use("/file", fileRouter);

module.exports = router;
