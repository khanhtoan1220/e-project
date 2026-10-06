const mongoose = require("mongoose");

const chiTietHoaDonSchema = new mongoose.Schema({
  menuId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Menu",
  },
  ten: {
    type: String,
    required: true,
  },
  gia: {
    type: Number,
    required: true,
  },
  soLuong: {
    type: Number,
    default: 1,
    min: 0,
  },
  ghiChu: String,
  canNao: {
    type: Boolean,
    default: true,
  },
  trangThaiMon: {
    type: String,
    enum: [
      "choXacNhan",
      "choCheBien",
      "dangLam",
      "daXong",
      "daPhucVu",
      "daHuy",
    ],
    default: "choXacNhan",
  },
});
const hoaDonSchema = new mongoose.Schema(
  {
    banId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BanAn",
      required: true,
    },
    trangThai: {
      type: String,
      enum: ["chuaThanhToan", "daThanhToan", "daHuy"],
      default: "chuaThanhToan",
    },
    danhSachMon: [chiTietHoaDonSchema],
    tongTien: { type: Number, default: 0 },
    thoiGianVao: { type: Date, default: Date.now },
    thoiGianRa: Date,
    qrTokenHash: { type: String, select: false, default: null },
    qrHetHan: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
hoaDonSchema.virtual("tongSoMon").get(function () {
  return this.danhSachMon.reduce((sum, mon) => sum + mon.soLuong, 0);
});

module.exports = mongoose.model("HoaDon", hoaDonSchema);
