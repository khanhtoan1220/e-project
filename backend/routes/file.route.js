const express = require("express");
const multer = require("multer");
const path = require("path");

const fileRouter = express.Router();

// cấu hình lưu file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads"); // chỉ định nơi lưu file
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // trả về tên file cho controller
  },
});
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // lọc file
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/gif",
      "application/pdf",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true); // cho phép lấy ảnh
    } else {
      cb(new Error("File không hợp lệ"), false); // báo lỗi và ko cho phép
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});
fileRouter.post("/upload", upload.single("file"), (req, res) => {
  // giả sử rằng key upoad là file
  res.json({
    message: "Upload file successfully",
    url: `/uploads/${req.file.filename}`,
  });
});
// upload nhieu file
fileRouter.post("/upload-multiple", upload.array("files", 5), (req, res) => {
  const fileNames = req.files.map((file) => `/uploads/${file.filename}`);
  res.json({
    message: "Upload files successfully",
    files: fileNames,
  });
});

module.exports = fileRouter;
