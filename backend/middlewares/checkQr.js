const crypto = require("crypto");
const HoaDon = require("../models/hoaDon.model");

const checkQr = async (req, res, next) => {
  try {
    const authorization = req.get("Authorization") || "";
    if (!/^Bearer [a-f0-9]{64}$/.test(authorization)) {
      return res.status(401).json({ message: "Vui lòng quét mã QR do nhân viên cung cấp." });
    }
    const token = authorization.slice(7);
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const hoaDon = await HoaDon.findOne({
      qrTokenHash: tokenHash,
      qrHetHan: { $gt: new Date() },
      trangThai: "chuaThanhToan",
    }).populate("banId");
    if (!hoaDon || !hoaDon.banId ||
        hoaDon.banId.trangThai !== "dangSuDung" ||
        String(hoaDon.banId.hoaDon) !== String(hoaDon._id)) {
      return res.status(401).json({ message: "QR hết hạn hoặc lượt phục vụ đã kết thúc. Vui lòng liên hệ nhân viên." });
    }
    req.hoaDonKhach = hoaDon;
    req.qrTokenHash = tokenHash;
    res.set("Cache-Control", "no-store");
    next();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
module.exports = checkQr;
