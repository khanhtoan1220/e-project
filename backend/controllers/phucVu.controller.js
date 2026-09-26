const BanAn = require("../models/banAn.model");
const HoaDon = require("../models/hoaDon.model");
const Menu = require("../models/menu.model");
const pusher = require("../config/pusher"); // 1. Import Pusher

// 1. Lấy sơ đồ bàn
exports.laySoDoBan = async (req, res) => {
  try {
    const list = await BanAn.find().populate("hoaDon").exec();
    res.json(list);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 2. Mở bàn
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

// 3. Gọi món
exports.goiMon = async (req, res) => {
  try {
    const { hoaDonId, chonMon } = req.body;
    // Thêm .populate("banId") để lấy tên bàn bắn thông báo
    const hoaDon = await HoaDon.findById(hoaDonId).populate("banId").exec();

    if (!hoaDon) {
      return res.status(404).json({ message: "Không tìm thấy hóa đơn" });
    }

    if (hoaDon.banId.trangThai !== "dangSuDung") {
      return res.status(403).json({
        message:
          "Bàn này hiện chưa mở hoặc đang chờ dọn dẹp, không thể gọi món!",
      });
    }

    for (let item of chonMon) {
      const monDetails = await Menu.findById(item.menuId).exec();
      if (monDetails) {
        hoaDon.danhSachMon.push({
          menuId: item.menuId,
          ten: monDetails.ten,
          gia: monDetails.gia,
          soLuong: item.soLuong,
          ghiChu: item.ghiChu,
          trangThaiMon: "choXacNhan",
        });
      }
    }

    hoaDon.tongTien = hoaDon.danhSachMon.reduce(
      (sum, mon) => sum + mon.gia * mon.soLuong,
      0,
    );
    const updatedHoaDon = await hoaDon.save();

    pusher.trigger("bep-channel", "co-don-moi", {
      message: `Bàn [${hoaDon.banId.ten}] vừa gửi yêu cầu gọi thêm món mới!`,
      hoaDonId: hoaDon._id,
    });

    res.json(updatedHoaDon);
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

// 5. Thanh toán
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

      // (Tùy chọn) Bắn thông báo dọn dẹp cho phục vụ
      pusher.trigger("nhan-vien-channel", "yeu-cau-don-ban", {
        message: `Khách đã thanh toán, vui lòng dọn dẹp bàn!`,
        banId: hoaDon.banId,
      });

      res.json({ message: "Thanh toán thành công", hoaDon });
    } else {
      res.status(404).json({ message: "Hóa đơn không tồn tại" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
