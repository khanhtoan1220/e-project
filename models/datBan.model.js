const mongoose = require("mongoose");

const datBanSchema = new mongoose.Schema(
  {
    tenKhach: { type: String, required: true },
    soDienThoai: { type: String, required: true },
    thoiGianDat: { type: Date, required: true },
    soNguoi: Number,
    trangThai: {
      type: String,
      enum: ["choXacNhan", "daXacNhan", "daDen", "daHuy"],
      default: "choXacNhan",
    },
    ghiChu: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("DatBan", datBanSchema);
