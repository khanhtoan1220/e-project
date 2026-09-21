const DatBan = require("../models/datBan.model");

exports.khachDatBan = async (req, res) => {
  try {
    const p = await DatBan.create(req.body);
    res.status(201).json(p);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const list = await DatBan.find().sort({ thoiGianDat: 1 }).exec();
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
      { new: true }
    );
    if (p) res.json(p);
    else res.status(404).json({ message: "Không tìm thấy phiếu đặt" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};