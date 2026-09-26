const express = require("express");
const router = express.Router();
const nhaBepController = require("../controllers/nhaBep.controller");
const { checkAuth, checkRole } = require("../middlewares/checkAuth");

router.get(
  "/mon-cho",
  checkAuth,
  checkRole(["admin", "bep"]),
  nhaBepController.getMonCho,
);

router.patch(
  "/cap-nhat-mon",
  checkAuth,
  checkRole(["admin", "bep"]),
  nhaBepController.updateTrangThaiMon,
);

module.exports = router;
