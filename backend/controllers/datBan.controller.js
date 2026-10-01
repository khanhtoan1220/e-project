const DatBan = require("../models/datBan.model");
const pusher = require("../config/pusher");

exports.khachDatBan = async (req, res) => {
  try {
    const p = await DatBan.create(req.body);
    pusher.trigger("nhan-vien-channel", "dat-ban-moi", {
      message: `Khách ${p.tenKhach} vừa đặt bàn cho ${p.soNguoi} người lúc ${p.thoiGianDat.toLocaleString()}`,
    });
    res.status(201).json(p);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { search, q, trangThai, ngay, page, limit, all } = req.query;
    let filter = {};

    const keyword = search || q;
    if (keyword && keyword.trim() !== "") {
      filter.$or = [
        { tenKhach: { $regex: keyword.trim(), $options: "i" } },
        { soDienThoai: { $regex: keyword.trim(), $options: "i" } },
      ];
    }

    if (trangThai) {
      filter.trangThai = trangThai;
    }

    if (ngay) {
      const start = new Date(ngay);
      start.setHours(0, 0, 0, 0);
      const end = new Date(ngay);
      end.setHours(23, 59, 59, 999);
      filter.thoiGianDat = { $gte: start, $lte: end };
    }

    if (page && all !== "true") {
      const currentPage = Math.max(1, parseInt(page) || 1);
      const currentLimit = Math.max(1, parseInt(limit) || 10);
      const skip = (currentPage - 1) * currentLimit;

      const [total, list] = await Promise.all([
        DatBan.countDocuments(filter),
        DatBan.find(filter)
          .sort({ thoiGianDat: -1 })
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

    const list = await DatBan.find(filter).sort({ thoiGianDat: -1 }).exec();
    res.json(list);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const p = await DatBan.findByIdAndUpdate(
      req.params.id,
      { trangThai: req.body.trangThai },
      { new: true },
    );
    if (p) res.json(p);
    else res.status(404).json({ message: "Không tìm thấy phiếu đặt" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
