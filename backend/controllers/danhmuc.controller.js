const Danhmuc = require("../models/danhmuc.model");

exports.getAll = async (req, res) => {
  try {
    const list = await Danhmuc.find().exec();
    res.json(list);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = req.body;
    const p = await Danhmuc.create(data);
    res.status(201).json(p);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const p = await Danhmuc.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (p) {
      res.json(p);
    } else {
      res.status(404).json({ message: "Không tìm thấy danh mục" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const p = await Danhmuc.findByIdAndDelete(id);
    if (p) {
      res.json({ message: "Xóa danh mục thành công" });
    } else {
      res.status(404).json({ message: "Không tìm thấy danh mục" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};