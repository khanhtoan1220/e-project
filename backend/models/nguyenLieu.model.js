const mongoose = require("mongoose");
const nguyenLieuSchema = new mongoose.Schema(
  {
    ten: {
      type: String,
      required: true,
      unique: true,
    },
    donVi: {
      type: String,
      required: true,
    },
    soLuongTon: {
      type: Number,
      min: 0,
      default: 1,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
nguyenLieuSchema.virtual("sapHet").get(function () {
  return this.soLuongTon < 10;
});
module.exports = mongoose.model("NguyenLieu", nguyenLieuSchema);
