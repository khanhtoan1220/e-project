const HoTro = require("../models/hoTro.model");
const BanAn = require("../models/banAn.model");
const HoaDon = require("../models/hoaDon.model");
const mongoose = require("mongoose");
const pusher = require("../config/pusher");
exports.guiYeuCau = async (req, res) => {
  try {
    const { loaiYeuCau, noiDung } = req.body;
    if (loaiYeuCau === "thanhToan") {
      return res.status(400).json({ message: "Vui lòng dùng nút yêu cầu thanh toán để nhân viên xác nhận." });
    }
    const banId = req.hoaDonKhach.banId._id;

    const ban = await BanAn.findById(banId).exec();
    if (!ban) {
      return res.status(404).json({ message: "Không tìm thấy bàn này" });
    }

    if (ban.trangThai !== "dangSuDung" || String(ban.hoaDon) !== String(req.hoaDonKhach._id)) {
      return res.status(403).json({
        message: "Bàn này hiện không hoạt động, không thể gửi yêu cầu hỗ trợ!",
      });
    }

    const yeuCauMoi = await HoTro.create({
      banId: banId,
      hoaDonId: req.hoaDonKhach._id,
      loaiYeuCau: loaiYeuCau,
      noiDung: noiDung,
      trangThai: "choXuLy",
    });
    pusher.trigger("nhan-vien-channel", "yeu-cau-moi", {
      message: `Bàn [${ban.ten}] yêu cầu hỗ trợ: ${noiDung || loaiYeuCau}`,
      banId: ban._id,
      loaiYeuCau: loaiYeuCau,
    });

    res.status(201).json({
      message: "Đã gửi yêu cầu tới nhân viên",
      data: yeuCauMoi,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.guiYeuCauTraMon = async (req, res) => {
  try {
    const { monHoaDonId, soLuongTra, lyDo } = req.body;
    if (!mongoose.isValidObjectId(monHoaDonId) || !Number.isSafeInteger(soLuongTra) || soLuongTra < 1) {
      return res.status(400).json({ message: "Món hoặc số lượng trả không hợp lệ." });
    }
    if (typeof lyDo !== "string" || !lyDo.trim() || lyDo.trim().length > 300) {
      return res.status(400).json({ message: "Vui lòng ghi lý do trả món, tối đa 300 ký tự." });
    }

    const hoaDon = req.hoaDonKhach;
    const mon = hoaDon.danhSachMon.id(monHoaDonId);
    if (!mon || !["daXong", "daPhucVu"].includes(mon.trangThaiMon) || mon.soLuong < 1) {
      return res.status(400).json({ message: "Chỉ có thể yêu cầu trả món đã hoàn thành và còn số lượng." });
    }

    const yeuCauDangCho = await HoTro.find({
      hoaDonId: hoaDon._id,
      monHoaDonId,
      loaiYeuCau: "traMon",
      trangThai: "choXuLy",
    }).exec();
    const soLuongDangCho = yeuCauDangCho.reduce((tong, item) => tong + item.soLuongTra, 0);
    if (soLuongTra + soLuongDangCho > mon.soLuong) {
      return res.status(400).json({ message: "Số lượng trả vượt quá số món còn lại." });
    }

    const yeuCauMoi = await HoTro.create({
      banId: hoaDon.banId,
      hoaDonId: hoaDon._id,
      loaiYeuCau: "traMon",
      monHoaDonId,
      tenMon: mon.ten,
      soLuongTra,
      noiDung: lyDo.trim(),
      trangThai: "choXuLy",
    });
    pusher.trigger("nhan-vien-channel", "yeu-cau-moi", {
      message: `Bàn [${hoaDon.banId.ten}] yêu cầu trả ${soLuongTra} ${mon.ten}.`,
      banId: hoaDon.banId._id,
      loaiYeuCau: "traMon",
    }).catch(console.error);

    res.status(201).json({ message: "Đã gửi yêu cầu trả món, vui lòng chờ nhân viên xác nhận.", data: yeuCauMoi });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.guiYeuCauThanhToan = async (req, res) => {
  try {
    const hoaDon = req.hoaDonKhach;
    const daCoYeuCau = await HoTro.findOne({
      hoaDonId: hoaDon._id,
      loaiYeuCau: "thanhToan",
      trangThai: "choXuLy",
    }).exec();
    if (daCoYeuCau) {
      return res.json({ message: "Yêu cầu thanh toán của bàn đang chờ nhân viên xác nhận.", data: daCoYeuCau });
    }

    const yeuCauMoi = await HoTro.create({
      banId: hoaDon.banId._id,
      hoaDonId: hoaDon._id,
      loaiYeuCau: "thanhToan",
      noiDung: "Khách yêu cầu thanh toán hóa đơn.",
      trangThai: "choXuLy",
    });
    pusher.trigger("nhan-vien-channel", "yeu-cau-moi", {
      message: `Bàn [${hoaDon.banId.ten}] yêu cầu thanh toán hóa đơn.`,
      banId: hoaDon.banId._id,
      loaiYeuCau: "thanhToan",
    }).catch(console.error);
    res.status(201).json({ message: "Đã gửi yêu cầu thanh toán tới nhân viên.", data: yeuCauMoi });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getDanhSachCho = async (req, res) => {
  try {
    const list = await HoTro.find({ trangThai: "choXuLy" })
      .populate("banId")
      .populate("hoaDonId", "trangThai danhSachMon tongTien")
      .sort({ createdAt: 1 })
      .exec();
    res.json(list);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.hoanTatYeuCau = async (req, res) => {
  try {
    const yeuCau = await HoTro.findById(req.params.id);
    if (!yeuCau) return res.status(404).json({ message: "Không tìm thấy yêu cầu để xử lý" });
    if (yeuCau.trangThai !== "choXuLy") {
      return res.status(409).json({ message: "Yêu cầu này đã được xử lý." });
    }

    const { ketQua } = req.body || {};
    if (yeuCau.loaiYeuCau === "traMon") {
      if (!["chapNhan", "tuChoi"].includes(ketQua)) {
        return res.status(400).json({ message: "Vui lòng chọn chấp nhận hoặc từ chối trả món." });
      }
      if (ketQua === "chapNhan") {
        const hoaDon = await HoaDon.findById(yeuCau.hoaDonId);
        if (!hoaDon || hoaDon.trangThai !== "chuaThanhToan") {
          return res.status(409).json({ message: "Hóa đơn đã kết thúc, không thể hoàn tiền món." });
        }
        const mon = hoaDon.danhSachMon.id(yeuCau.monHoaDonId);
        if (!mon || !["daXong", "daPhucVu"].includes(mon.trangThaiMon) || mon.soLuong < yeuCau.soLuongTra) {
          return res.status(409).json({ message: "Số lượng món đã thay đổi, hãy kiểm tra lại hóa đơn." });
        }
        yeuCau.giaHoanTra = mon.gia * yeuCau.soLuongTra;
        mon.soLuong -= yeuCau.soLuongTra;
        if (mon.soLuong === 0) mon.trangThaiMon = "daTra";
        hoaDon.tongTien = Math.max(0, hoaDon.tongTien - yeuCau.giaHoanTra);
        await hoaDon.save();
      }
      yeuCau.ketQuaXuLy = ketQua;
    }

    if (yeuCau.loaiYeuCau === "thanhToan") {
      if (!["chapNhan", "tuChoi"].includes(ketQua)) {
        return res.status(400).json({ message: "Vui lòng xác nhận đã thu tiền hoặc đóng yêu cầu." });
      }
      if (ketQua === "chapNhan") {
        const hoaDon = await HoaDon.findById(yeuCau.hoaDonId);
        if (!hoaDon || hoaDon.trangThai !== "chuaThanhToan") {
          return res.status(409).json({ message: "Hóa đơn đã kết thúc hoặc không còn cần thanh toán." });
        }
        const conMonChuaHoanThanh = hoaDon.danhSachMon.some(
          (mon) => !["daXong", "daPhucVu", "daHuy", "daTra"].includes(mon.trangThaiMon),
        );
        if (conMonChuaHoanThanh) {
          return res.status(400).json({ message: "Vẫn còn món đang chờ xác nhận hoặc chế biến." });
        }
        const daThanhToan = await HoaDon.findOneAndUpdate(
          {
            _id: hoaDon._id,
            trangThai: "chuaThanhToan",
            danhSachMon: { $not: { $elemMatch: { trangThaiMon: { $nin: ["daXong", "daPhucVu", "daHuy", "daTra"] } } } },
          },
          { trangThai: "daThanhToan", thoiGianRa: new Date() },
          { new: true },
        );
        if (!daThanhToan) return res.status(409).json({ message: "Hóa đơn vừa thay đổi, vui lòng tải lại." });
        await BanAn.findOneAndUpdate(
          { _id: daThanhToan.banId, hoaDon: daThanhToan._id },
          { trangThai: "trong", hoaDon: null },
        );
      }
      yeuCau.ketQuaXuLy = ketQua;
    }

    yeuCau.trangThai = "hoanTat";
    await yeuCau.save();
    res.json({ message: ketQua === "chapNhan" ? "Đã chấp nhận trả món và cập nhật hóa đơn." : "Đã xử lý xong yêu cầu.", data: yeuCau });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
