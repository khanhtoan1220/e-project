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
        // Bếp chỉ được xem các món đã duyệt (trạng thái choCheBien hoặc dangLam)
        // Ẩn hoàn toàn các món mới do khách quét QR tự đặt đang ở trạng thái choXacNhan
        if (
          mon.trangThaiMon === "choCheBien" ||
          mon.trangThaiMon === "dangLam"
        ) {
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

    const trangThaiCu = monItem.trangThaiMon;
    monItem.trangThaiMon = trangThaiMoi;

    if (trangThaiMoi === "daXong" && trangThaiCu !== "daXong") {
      const monChinh = await Menu.findById(monItem.menuId).exec();
      if (monChinh && monChinh.dinhLuong) {
        for (const dl of monChinh.dinhLuong) {
          await NguyenLieu.findByIdAndUpdate(dl.nguyenLieuID, {
            $inc: { soLuongTon: -(dl.soLuong * monItem.soLuong) },
          });
        }
      }
    }

    if (trangThaiMoi === "daHuy" && trangThaiCu === "daXong") {
      const monChinh = await Menu.findById(monItem.menuId).exec();
      if (monChinh && monChinh.dinhLuong) {
        for (const dl of monChinh.dinhLuong) {
          await NguyenLieu.findByIdAndUpdate(dl.nguyenLieuID, {
            $inc: { soLuongTon: dl.soLuong * monItem.soLuong },
          });
        }
      }
    }

    // Tự động tính toán lại tổng tiền hóa đơn, loại bỏ các món đã bị hủy
    hoaDon.tongTien = hoaDon.danhSachMon.reduce((sum, mon) => {
      if (mon.trangThaiMon === "daHuy") return sum;
      return sum + mon.gia * mon.soLuong;
    }, 0);

    await hoaDon.save();
    res.json({ message: "Cập nhật thành công", hoaDon });
    pusher.trigger("nhan-vien-channel", "mon-da-xong", {
      message: `Món "${monItem.ten}" đã nấu xong`,
      banId: hoaDon.banId,
      hoaDonId: hoaDon._id,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
