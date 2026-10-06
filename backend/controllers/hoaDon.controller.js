const HoaDon = require("../models/hoaDon.model");
const BanAn = require("../models/banAn.model");

exports.getAll = async (req, res) => {
  try {
    const { trangThai, banId, tuNgay, denNgay, page, limit, all } = req.query;
    let filter = {};

    if (trangThai) {
      filter.trangThai = trangThai;
    }

    if (banId) {
      filter.banId = banId;
    }

    if (tuNgay || denNgay) {
      filter.createdAt = {};
      if (tuNgay) {
        const start = new Date(tuNgay);
        start.setHours(0, 0, 0, 0);
        filter.createdAt.$gte = start;
      }
      if (denNgay) {
        const end = new Date(denNgay);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    if (page && all !== "true") {
      const currentPage = Math.max(1, parseInt(page) || 1);
      const currentLimit = Math.max(1, parseInt(limit) || 10);
      const skip = (currentPage - 1) * currentLimit;

      const [total, list] = await Promise.all([
        HoaDon.countDocuments(filter),
        HoaDon.find(filter)
          .populate("banId", "ten khuVuc")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(currentLimit)
          .exec(),
      ]);

      return res.json({
        data: list,
        pagination: {
          total,
          page: currentPage,
          limit: currentLimit,
          totalPages: Math.ceil(total / currentLimit),
        },
      });
    }

    const list = await HoaDon.find(filter)
      .populate("banId", "ten khuVuc")
      .sort({ createdAt: -1 })
      .exec();
    res.json(list);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getDetail = async (req, res) => {
  try {
    const hoaDon = await HoaDon.findById(req.params.id)
      .populate("banId", "ten khuVuc")
      .populate("danhSachMon.menuId", "ten hinhAnh gia")
      .exec();

    if (!hoaDon) {
      return res.status(404).json({ message: "Không tìm thấy hóa đơn" });
    }
    res.json(hoaDon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.huyHoaDon = async (req, res) => {
  try {
    const hoaDon = await HoaDon.findById(req.params.id).exec();
    if (!hoaDon) {
      return res.status(404).json({ message: "Không tìm thấy hóa đơn" });
    }

    if (hoaDon.trangThai === "daThanhToan") {
      return res
        .status(400)
        .json({ message: "Không thể hủy hóa đơn đã thanh toán thành công" });
    }

    const daHuy = await HoaDon.findOneAndUpdate(
      { _id: hoaDon._id, trangThai: "chuaThanhToan" },
      { trangThai: "daHuy", thoiGianRa: new Date(), qrTokenHash: null, qrHetHan: null },
      { new: true },
    );
    if (!daHuy) return res.status(409).json({ message: "Hóa đơn đã kết thúc." });
    await BanAn.findOneAndUpdate(
      { _id: daHuy.banId, hoaDon: daHuy._id },
      { trangThai: "choDonDep", hoaDon: null },
    );

    res.json({
      message: "Đã hủy hóa đơn, bàn chuyển sang chờ dọn",
      data: daHuy,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
