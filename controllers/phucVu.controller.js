const BanAn = require("../models/banAn.model");
const HoaDon = require("../models/hoaDon.model");
const Menu = require("../models/menu.model");

exports.laySoDoBan = async (req, res) => {
  try {
    const list = await BanAn.find().populate("hoaDon").exec();
    res.json(list);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.moBan = async (req, res) => {
  try {
    const { banId } = req.body;
    const hoaDonMoi = await HoaDon.create({
      banId: banId,
      danhSachMon: [],
      trangThai: "chuaThanhToan",
    });

    const banUpdate = await BanAn.findByIdAndUpdate(
      banId,
      { trangThai: "dangSuDung", hoaDon: hoaDonMoi._id },
      { new: true, runValidators: true },
    );

    if (banUpdate) {
      res.status(201).json(hoaDonMoi);
    } else {
      res.status(404).json({ message: "Không tìm thấy bàn để mở" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.goiMon = async (req, res) => {
  try {
    const { hoaDonId, chonMon } = req.body;
    const hoaDon = await HoaDon.findById(hoaDonId).populate("banId").exec(); // Thêm populate banId

    if (!hoaDon)
      return res.status(404).json({ message: "Không tìm thấy hóa đơn" });

    // --- BƯỚC CHẶN QUAN TRỌNG ---
    if (hoaDon.banId.trangThai !== "dangSuDung") {
      return res.status(403).json({
        message:
          "Bàn này hiện chưa mở hoặc đang đợi dọn dẹp, không thể gọi món!",
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getHoaDonTheoBan = async (req, res) => {
  try {
    const idBan = req.params.id;
    const p = await HoaDon.findOne({ banId: idBan, trangThai: "chuaThanhToan" })
      .populate("banId")
      .exec();
    if (p) {
      res.json(p);
    } else {
      res
        .status(404)
        .json({ message: "Bàn này hiện không có hóa đơn chưa thanh toán" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.thanhToan = async (req, res) => {
  try {
    const { hoaDonId } = req.body;
    const hoaDon = await HoaDon.findByIdAndUpdate(
      hoaDonId,
      { trangThai: "daThanhToan", thoiGianRa: Date.now() },
      { new: true },
    );

    if (hoaDon) {
      await BanAn.findByIdAndUpdate(hoaDon.banId, {
        trangThai: "choDonDep",
        hoaDon: null,
      });
      res.json({ message: "Thanh toán thành công", hoaDon });
    } else {
      res.status(404).json({ message: "Hóa đơn không tồn tại" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.hoanTatDonBan = async (req, res) => {
  try {
    const idBan = req.params.id;
    const ban = await BanAn.findById(idBan).exec();

    if (!ban) return res.status(404).json({ message: "Không tìm thấy bàn" });

    if (ban.trangThai !== "choDonDep") {
      return res
        .status(400)
        .json({ message: "Bàn này hiện không cần dọn dẹp" });
    }

    ban.trangThai = "trong";
    await ban.save();

    res.json({ message: "Bàn đã dọn xong và sẵn sàng đón khách", data: ban });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
