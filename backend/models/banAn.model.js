const mongoose = require("mongoose");
const banAnSchema = new mongoose.Schema(
  {
    ten: {
      type: String,
      required: true,
      unique: true,
    },
    khuVuc: {
      type: String,
      required: true,
      enum: ["tang1", "tang2", "tang3"],
    },
    trangThai: {
      type: String,
      enum: ["trong", "dangSuDung", "datTruoc", "choDonDep"],
      default: "trong",
    },
    hoaDon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HoaDon",
    },
  },
  { timestamps: true },
);
module.exports = mongoose.model("BanAn", banAnSchema);
