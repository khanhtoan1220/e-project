const BanAn = require("../models/banAn.model");
const HoaDon = require("../models/hoaDon.model");
const pusher = require("../config/pusher");

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
    const p = await BanAn.create({ ten, khuVuc, trangThai: "trong" });
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

// QR cố định mở bàn lần đầu và trả hóa đơn hiện có nếu bàn đang phục vụ.
exports.moBanChoKhach = async (req, res) => {
  try {
    const { id } = req.params;
    let ban = await BanAn.findById(id).exec();
    if (!ban) return res.status(404).json({ message: "Không tìm thấy bàn." });

    if (ban.trangThai === "dangSuDung" && ban.hoaDon) {
      const hoaDonHienTai = await HoaDon.findOne({
        _id: ban.hoaDon, banId: ban._id, trangThai: "chuaThanhToan",
      }).populate("banId").exec();
      if (!hoaDonHienTai) {
        return res.status(409).json({ message: "Bàn đang phục vụ nhưng không có hóa đơn hoạt động." });
      }
      return res.json({ message: "Bàn đã mở.", hoaDon: hoaDonHienTai });
    }

    if (!["trong", "datTruoc"].includes(ban.trangThai)) {
      return res.status(409).json({ message: "Bàn đang chờ nhân viên dọn dẹp." });
    }

    const hoaDonMoi = await HoaDon.create({ banId: ban._id, danhSachMon: [] });
    const banCapNhat = await BanAn.findOneAndUpdate(
      { _id: ban._id, trangThai: ban.trangThai, hoaDon: ban.hoaDon || null },
      { trangThai: "dangSuDung", hoaDon: hoaDonMoi._id },
      { new: true, runValidators: true },
    );

    if (!banCapNhat) {
      await HoaDon.findByIdAndDelete(hoaDonMoi._id);
      ban = await BanAn.findById(id).exec();
      if (ban?.trangThai === "dangSuDung" && ban.hoaDon) {
        const hoaDonHienTai = await HoaDon.findOne({
          _id: ban.hoaDon, banId: ban._id, trangThai: "chuaThanhToan",
        }).populate("banId").exec();
        if (hoaDonHienTai) return res.json({ message: "Bàn đã được mở.", hoaDon: hoaDonHienTai });
      }
      return res.status(409).json({ message: "Bàn vừa được cập nhật. Vui lòng quét lại mã QR." });
    }

    const hoaDon = await HoaDon.findById(hoaDonMoi._id).populate("banId").exec();
    pusher.trigger("nhan-vien-channel", "yeu-cau-moi", {
      message: "Khách vừa mở " + ban.ten + " bằng mã QR cố định.",
      banId: ban._id,
    });
    res.status(201).json({ message: "Mở bàn thành công.", hoaDon });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getThongTinBanChoKhach = async (req, res) => {
  try {
    const ban = await BanAn.findById(req.params.id).populate("hoaDon").exec();
    if (!ban) return res.status(404).json({ message: "Không tìm thấy bàn." });
    if (ban.trangThai === "dangSuDung" &&
        (!ban.hoaDon || ban.hoaDon.trangThai !== "chuaThanhToan")) {
      return res.status(409).json({ message: "Bàn chưa có hóa đơn đang hoạt động." });
    }
    const hoaDon = ban.trangThai === "dangSuDung" ? ban.hoaDon : null;
    res.json({
      banId: ban._id, tenBan: ban.ten, khuVuc: ban.khuVuc,
      trangThai: ban.trangThai, hoaDonId: hoaDon?._id || null,
      tongTienTamTinh: hoaDon?.tongTien || 0,
      danhSachMonDaGoi: hoaDon?.danhSachMon || [],
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
