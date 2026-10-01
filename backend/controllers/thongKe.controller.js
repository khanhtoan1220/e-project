const HoaDon = require("../models/hoaDon.model");
const NguyenLieu = require("../models/nguyenLieu.model");

exports.getDoanhThuChung = async (req, res) => {
  try {
    const { thang, nam } = req.query;
    let filter = { trangThai: "daThanhToan" }; // Chỉ tính hóa đơn đã thanh toán

    if (thang && nam) {
      const ngayBatDau = new Date(nam, thang - 1, 1);
      const ngayKetThuc = new Date(nam, thang, 0, 23, 59, 59); // Ngày cuối cùng của tháng
      filter.createdAt = { $gte: ngayBatDau, $lte: ngayKetThuc };
    }

    const thongKe = await HoaDon.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          tongDoanhThu: { $sum: "$tongTien" }, // Cộng tổng tiền
          tongLuotKhach: { $sum: 1 }, // Đếm số hóa đơn thành công
          trungBinhMoiHoaDon: { $avg: "$tongTien" }, // Tính trung bình mỗi đơn
        },
      },
    ]).exec();

    res.json(
      thongKe[0] || {
        tongDoanhThu: 0,
        tongLuotKhach: 0,
        trungBinhMoiHoaDon: 0,
      },
    );
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getXepHangMon = async (req, res) => {
  try {
    const { kieu } = req.query; // Nhận tham số ?kieu=banchay hoặc ?kieu=bane
    const sapXep = kieu === "bane" ? 1 : -1; // 1 là tăng dần (ế), -1 là giảm dần (chạy)

    const list = await HoaDon.aggregate([
      { $match: { trangThai: "daThanhToan" } },
      { $unwind: "$danhSachMon" }, // Trải phẳng mảng món ăn
      {
        $group: {
          _id: "$danhSachMon.ten",
          soLuongDaBan: { $sum: "$danhSachMon.soLuong" },
          doanhThuMon: {
            $sum: { $multiply: ["$danhSachMon.gia", "$danhSachMon.soLuong"] },
          },
        },
      },
      { $sort: { soLuongDaBan: sapXep } },
      { $limit: 10 },
    ]).exec();

    res.json(list);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getCanhBaoKho = async (req, res) => {
  try {
    const list = await NguyenLieu.find({ soLuongTon: { $lt: 10 } }).exec();
    res.json(list);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Alias để tránh nhầm lẫn tên hàm giữa các file
exports.getDoanhThu = exports.getDoanhThuChung;
exports.getMonBanChay = exports.getXepHangMon;
exports.getTonKhoThap = exports.getCanhBaoKho;
