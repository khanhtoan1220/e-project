const NguyenLieu = require("../models/nguyenLieu.model");

exports.getAll = async (req, res) => {
  try {
    const list = await NguyenLieu.find().exec();
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

exports.nhapKho = async (req, res) => {
  try {
    const { id, soLuongThem } = req.body;
    const p = await NguyenLieu.findByIdAndUpdate(
      id,
      { $inc: { soLuongTon: soLuongThem } },
      { new: true }
    );
    if (p) res.json(p);
    else res.status(404).json({ message: "Không tìm thấy nguyên liệu" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};