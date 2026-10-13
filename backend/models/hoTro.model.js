const mongoose = require("mongoose");

const yeuCauHoTroSchema = new mongoose.Schema(
  {
    banId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BanAn",
      required: true,
    },
    hoaDonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HoaDon",
    },
    loaiYeuCau: {
      type: String,
      enum: ["goiNhanVien", "themDungCu", "themNuoc", "thanhToan", "traMon", "khac"],
      required: true,
    },
    monHoaDonId: { type: mongoose.Schema.Types.ObjectId },
    tenMon: String,
    soLuongTra: { type: Number, min: 1 },
    giaHoanTra: { type: Number, min: 0 },
    ketQuaXuLy: { type: String, enum: ["chapNhan", "tuChoi"] },
    noiDung: String,
    trangThai: {
      type: String,
      enum: ["choXuLy", "dangXuLy", "hoanTat"],
      default: "choXuLy",
    },
  },
  { timestamps: true },
);

yeuCauHoTroSchema.set("toJSON", { virtuals: true });
yeuCauHoTroSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("YeuCauHoTro", yeuCauHoTroSchema);
