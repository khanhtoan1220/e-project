const mongoose = require("mongoose");

const dinhLuongSchema = new mongoose.Schema({
  nguyenLieuID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "NguyenLieu",
    required: true,
  },
  soLuong: Number,
  donVi: String,
});

const menuSchema = new mongoose.Schema(
  {
    ten: {
      type: String,
      required: true,
    },
    gia: {
      type: Number,
      min: 0,
      required: true,
    },
    hinhAnh: String,
    danhMucId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DanhMuc",
      required: true,
    },
    conBan: {
      type: Boolean,
      default: true,
    },
    dinhLuong: [dinhLuongSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
module.exports = mongoose.model("Menu", menuSchema);
