const mongoose = require("mongoose");
const BanAn = require("../models/banAn.model");
const HoaDon = require("../models/hoaDon.model");

const checkBanDangSuDung = async (req, res, next) => {
  try {
    const banId = req.params.id || req.body.banId;
    if (!mongoose.isValidObjectId(banId)) {
      return res.status(400).json({ message: "Mã bàn không hợp lệ." });
    }
    const ban = await BanAn.findById(banId).exec();
    if (!ban) return res.status(404).json({ message: "Không tìm thấy bàn." });
    if (ban.trangThai !== "dangSuDung" || !ban.hoaDon) {
      return res.status(409).json({ message: "Bàn chưa có lượt phục vụ đang hoạt động." });
    }
    const hoaDon = await HoaDon.findOne({
      _id: ban.hoaDon, banId: ban._id, trangThai: "chuaThanhToan",
    }).populate("banId").exec();
    if (!hoaDon) {
      return res.status(409).json({ message: "Lượt phục vụ đã kết thúc. Vui lòng quét lại mã QR trên bàn." });
    }
    req.hoaDonKhach = hoaDon;
    next();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
module.exports = checkBanDangSuDung;
