const mongoose = require("mongoose");

const nguoiDungSchema = new mongoose.Schema(
  {
    tenDangNhap: { type: String, required: true, unique: true },
    matKhau: { type: String, required: true },
    hoTen: String,
    vaiTro: {
      type: String,
      enum: ["admin", "phucVu", "bep"],
      default: "phucVu",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("NguoiDung", nguoiDungSchema);
