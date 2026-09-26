const Menu = require("../models/menu.model");

exports.getAll = async (req, res) => {
  try {
    const list = await Menu.find().populate("danhMucId").exec();
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
