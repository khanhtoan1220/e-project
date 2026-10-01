const Menu = require("../models/menu.model");

exports.getAll = async (req, res) => {
  try {
    const {
      search,
      q,
      danhMuc,
      conBan,
      minGia,
      maxGia,
      sort,
      page,
      limit,
      all,
    } = req.query;
    let filter = {};

    const keyword = search || q;
    if (keyword && keyword.trim() !== "") {
      filter.ten = { $regex: keyword.trim(), $options: "i" };
    }

    if (danhMuc) {
      filter.danhMucId = danhMuc;
    }

    if (conBan !== undefined && conBan !== "") {
      filter.conBan = conBan === "true" || conBan === true;
    }

    if (minGia !== undefined || maxGia !== undefined) {
      filter.gia = {};
      if (minGia) filter.gia.$gte = Number(minGia);
      if (maxGia) filter.gia.$lte = Number(maxGia);
    }

    let sortOption = { createdAt: -1 }; // Mặc định món mới nhất lên đầu
    if (sort === "gia_asc") sortOption = { gia: 1 };
    else if (sort === "gia_desc") sortOption = { gia: -1 };
    else if (sort === "ten_asc") sortOption = { ten: 1 };
    else if (sort === "ten_desc") sortOption = { ten: -1 };
    else if (sort === "cu_nhat") sortOption = { createdAt: 1 };

    if (page && all !== "true") {
      const currentPage = Math.max(1, parseInt(page) || 1);
      const currentLimit = Math.max(1, parseInt(limit) || 10);
      const skip = (currentPage - 1) * currentLimit;

      const [total, list] = await Promise.all([
        Menu.countDocuments(filter),
        Menu.find(filter)
          .populate("danhMucId")
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

    const list = await Menu.find(filter)
      .populate("danhMucId")
      .sort(sortOption)
      .exec();
    res.json(list);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.create = async (req, res) => {
  try {
    const data = req.body;
    const p = await Menu.create(data);
    res.status(201).json(p);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.getDetail = async (req, res) => {
  try {
    const p = await Menu.findById(req.params.id)
      .populate("dinhLuong.nguyenLieuID")
      .exec();
    if (p) res.json(p);
    else res.status(404).json({ message: "Không thấy món" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.updateStatus = async (req, res) => {
  try {
    const { conBan } = req.body;
    const p = await Menu.findByIdAndUpdate(
      req.params.id,
      { conBan: conBan },
      { new: true },
    );
    res.json(p);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.update = async (req, res) => {
  try {
    const p = await Menu.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (p) res.json(p);
    else res.status(404).json({ message: "Không tìm thấy món ăn" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const p = await Menu.findByIdAndDelete(req.params.id);
    if (p) res.json({ message: "Xóa món ăn thành công" });
    else res.status(404).json({ message: "Không tìm thấy món ăn" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
