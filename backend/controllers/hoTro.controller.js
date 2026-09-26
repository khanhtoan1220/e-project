const HoTro = require("../models/hoTro.model");
const BanAn = require("../models/banAn.model"); // Import thêm Model Bàn để check trạng thái

exports.guiYeuCau = async (req, res) => {
  try {
    const { banId, loaiYeuCau, noiDung } = req.body;

    const ban = await BanAn.findById(banId).exec();
    if (!ban) {
      return res.status(404).json({ message: "Không tìm thấy bàn này" });
    }

    if (ban.trangThai !== "dangSuDung") {
      return res.status(403).json({
        message: "Bàn này hiện không hoạt động, không thể gửi yêu cầu hỗ trợ!",
      });
    }

    const yeuCauMoi = await HoTro.create({
      banId: banId,
      loaiYeuCau: loaiYeuCau,
      noiDung: noiDung,
      trangThai: "choXuLy",
    });

    res.status(201).json({
      message: "Đã gửi yêu cầu tới nhân viên",
      data: yeuCauMoi,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getDanhSachCho = async (req, res) => {
  try {
    const list = await HoTro.find({ trangThai: "choXuLy" })
      .populate("banId")
      .sort({ createdAt: 1 })
      .exec();
    res.json(list);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.hoanTatYeuCau = async (req, res) => {
  try {
    const p = await HoTro.findByIdAndUpdate(
      req.params.id,
      { trangThai: "hoanTat" },
      { new: true },
    );
    if (p) {
      res.json({ message: "Đã xử lý xong yêu cầu", data: p });
    } else {
      res.status(404).json({ message: "Không tìm thấy yêu cầu để xử lý" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
