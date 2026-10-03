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
  try {
    const { id } = req.params;

    const ban = await BanAn.findById(id).populate("hoaDon").exec();

    if (!ban) {
      return res
        .status(404)
        .json({ message: "Bàn ăn không tồn tại hoặc đã bị xóa" });
    }

    // Trả về thông tin bàn kèm mã hóa đơn để khách gọi món
    res.json({
      banId: ban._id,
      tenBan: ban.ten,
      khuVuc: ban.khuVuc,
      trangThai: ban.trangThai, // "trong", "dangSuDung", "choDonDep"
      hoaDonId: ban.hoaDon ? ban.hoaDon._id : null,
      tongTienTamTinh: ban.hoaDon ? ban.hoaDon.tongTien : 0,
      danhSachMonDaGoi: ban.hoaDon ? ban.hoaDon.danhSachMon : [],
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
