const pusher = require("../config/pusher");
const HoaDon = require("../models/hoaDon.model");
const Menu = require("../models/menu.model");
const NguyenLieu = require("../models/nguyenLieu.model");

exports.getMonCho = async (req, res) => {
  try {
    const dsHoaDon = await HoaDon.find({ trangThai: "chuaThanhToan" }).exec();
    const monCho = [];
    dsHoaDon.forEach((hd) => {
      hd.danhSachMon.forEach((mon) => {
        if (mon.trangThaiMon !== "daPhucVu" && mon.trangThaiMon !== "daHuy") {
          monCho.push({ hoaDonId: hd._id, banId: hd.banId, item: mon });
        }
      });
    });
    res.json(monCho);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateTrangThaiMon = async (req, res) => {
  try {
    const { hoaDonId, monItemObjectId, trangThaiMoi } = req.body;
    const hoaDon = await HoaDon.findById(hoaDonId).exec();
    if (!hoaDon) return res.status(404).json({ message: "Không thấy hóa đơn" });

    const monItem = hoaDon.danhSachMon.id(monItemObjectId);
    if (!monItem) return res.status(404).json({ message: "Không thấy món" });

    monItem.trangThaiMon = trangThaiMoi;

    if (trangThaiMoi === "daXong") {
      const monChinh = await Menu.findById(monItem.menuId).exec();
      if (monChinh && monChinh.dinhLuong) {
        for (const dl of monChinh.dinhLuong) {
          await NguyenLieu.findByIdAndUpdate(dl.nguyenLieuID, {
            $inc: { soLuongTon: -(dl.soLuong * monItem.soLuong) },
          });
        }
      }
    }

    await hoaDon.save();
    res.json({ message: "Cập nhật thành công" });
    pusher.trigger("kenh-nhan-vien", "mon-da-xong", {
      messsage: "Món đã nấu xong",
      banId: hoaDon.banId,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
