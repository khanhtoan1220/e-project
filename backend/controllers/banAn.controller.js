const BanAn = require("../models/banAn.model");

exports.getAll = async (req, res) => {
  try {
    const list = await BanAn.find().exec();
    res.json(list);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { ten, khuVuc } = req.body;
    const p = await BanAn.create({
      ten: ten,
      khuVuc: khuVuc,
      trangThai: "trong",
    });
    res.status(201).json(p);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const p = await BanAn.findByIdAndDelete(req.params.id);
    if (p) res.json({ message: "Xóa bàn thành công" });
    else res.status(404).json({ message: "Không tìm thấy bàn" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getThongTinBanChoKhach = async (req, res) => {
  const hoaDon = req.hoaDonKhach;
  const ban = hoaDon.banId;
  if (String(ban._id) !== req.params.id) {
    return res.status(403).json({ message: "QR không thuộc bàn này." });
  }
  res.json({
    banId: ban._id, tenBan: ban.ten, khuVuc: ban.khuVuc,
    trangThai: ban.trangThai, hoaDonId: hoaDon._id,
    tongTienTamTinh: hoaDon.tongTien, danhSachMonDaGoi: hoaDon.danhSachMon,
  });
};
