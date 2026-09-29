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

    // 1. Tìm kiếm theo tên món ăn
    const keyword = search || q;
    if (keyword && keyword.trim() !== "") {
      filter.ten = { $regex: keyword.trim(), $options: "i" };
    }

    // 2. Lọc theo danh mục
    if (danhMuc) {
      filter.danhMucId = danhMuc;
    }

    // 3. Lọc theo trạng thái còn bán / hết hàng
    if (conBan !== undefined && conBan !== "") {
      filter.conBan = conBan === "true" || conBan === true;
    }

    // 4. Lọc theo khoảng giá
    if (minGia !== undefined || maxGia !== undefined) {
      filter.gia = {};
      if (minGia) filter.gia.$gte = Number(minGia);
      if (maxGia) filter.gia.$lte = Number(maxGia);
    }

    // 5. Sắp xếp (Sort)
    let sortOption = { createdAt: -1 }; // Mặc định món mới nhất lên đầu
    if (sort === "gia_asc") sortOption = { gia: 1 };
    else if (sort === "gia_desc") sortOption = { gia: -1 };
    else if (sort === "ten_asc") sortOption = { ten: 1 };
    else if (sort === "ten_desc") sortOption = { ten: -1 };
    else if (sort === "cu_nhat") sortOption = { createdAt: 1 };

    // 6. Xử lý phân trang (Pagination)
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

    // Nếu không truyền page hoặc truyền all=true: trả về toàn bộ mảng (đảm bảo tương thích code cũ)
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

// Xóa món ăn
exports.delete = async (req, res) => {
  try {
    const p = await Menu.findByIdAndDelete(req.params.id);
    if (p) res.json({ message: "Xóa món ăn thành công" });
    else res.status(404).json({ message: "Không tìm thấy món ăn" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
