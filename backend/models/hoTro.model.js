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
      enum: ["goiNhanVien", "themDungCu", "themNuoc", "thanhToan", "khac"],
      required: true,
    },
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
