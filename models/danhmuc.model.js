const mongoose = require("mongoose");

const danhMucSchema = new mongoose.Schema(
  {
    ten: {
      type: String,
      required: true,
      unique: true,
    },
    moTa: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);
module.exports = mongoose.model("DanhMuc", danhMucSchema);
