const NguyenLieu = require("../models/nguyenLieu.model");

exports.getAll = async (req, res) => {
  try {
    const { search, q, tinhTrang, sort, page, limit, all } = req.query;
    let filter = {};

    const keyword = search || q;
    if (keyword && keyword.trim() !== "") {
      filter.ten = { $regex: keyword.trim(), $options: "i" };
    }

    if (tinhTrang === "hetHang") {
      filter.soLuongTon = { $lte: 0 };
    } else if (tinhTrang === "sapHet") {
      filter.soLuongTon = { $gt: 0, $lt: 10 };
    } else if (tinhTrang === "conHang") {
      filter.soLuongTon = { $gte: 10 };
    }

    // 3. Sắp xếp
    let sortOption = { ten: 1 };
    if (sort === "ton_asc") sortOption = { soLuongTon: 1 };
    else if (sort === "ton_desc") sortOption = { soLuongTon: -1 };
    else if (sort === "ten_desc") sortOption = { ten: -1 };
    else if (sort === "moi_nhat") sortOption = { createdAt: -1 };

    if (page && all !== "true") {
      const currentPage = Math.max(1, parseInt(page) || 1);
      const currentLimit = Math.max(1, parseInt(limit) || 10);
      const skip = (currentPage - 1) * currentLimit;

      const [total, list] = await Promise.all([
        NguyenLieu.countDocuments(filter),
        NguyenLieu.find(filter)
          .sort(sortOption)
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

    const list = await NguyenLieu.find(filter).sort(sortOption).exec();
    res.json(list);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const p = await NguyenLieu.create(req.body);
    res.status(201).json(p);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const p = await NguyenLieu.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (p) res.json(p);
    else res.status(404).json({ message: "Không tìm thấy nguyên liệu" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const p = await NguyenLieu.findByIdAndDelete(req.params.id);
    if (p) res.json({ message: "Xóa nguyên liệu thành công" });
    else res.status(404).json({ message: "Không tìm thấy nguyên liệu" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.nhapKho = async (req, res) => {
  try {
    const { id, soLuongThem } = req.body;
    if (!soLuongThem || Number(soLuongThem) <= 0) {
      return res
        .status(400)
        .json({ message: "Số lượng nhập thêm phải lớn hơn 0" });
    }
    const p = await NguyenLieu.findByIdAndUpdate(
      id,
      { $inc: { soLuongTon: Number(soLuongThem) } },
      { new: true },
    );
    if (p) res.json(p);
    else res.status(404).json({ message: "Không tìm thấy nguyên liệu" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
