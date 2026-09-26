const express = require("express");
const router = express.Router();
const danhmucController = require("../controllers/danhmuc.controller");
const menuController = require("../controllers/menu.controller");
const { checkAuth, checkRole } = require("../middlewares/checkAuth");

router.get("/danh-muc", danhmucController.getAll);
router.get("/mon-an", menuController.getAll);
router.get("/mon-an/:id", menuController.getDetail);

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

router.post("/mon-an", checkAuth, checkRole(["admin"]), menuController.create);

router.put(
  "/mon-an/:id",
  checkAuth,
  checkRole(["admin"]),
  menuController.update,
);

router.delete(
  "/mon-an/:id",
  checkAuth,
  checkRole(["admin"]),
  menuController.delete,
);

router.patch(
  "/mon-an/:id/status",
  checkAuth,
  checkRole(["admin"]),
  menuController.updateStatus,
);

module.exports = router;
