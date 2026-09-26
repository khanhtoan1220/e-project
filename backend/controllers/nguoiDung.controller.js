const NguoiDung = require("../models/nguoiDung.model");
const bcrypt = require("bcrypt");

exports.dangKy = async (req, res) => {
  const { hoTen, tenDangNhap, matKhau, vaiTro } = req.body;
  try {
    const exists = await NguoiDung.findOne({ tenDangNhap: tenDangNhap });
    if (exists) {
      return res.status(400).json({
        message: "Tên đăng nhập đã tồn tại",
      });
    }

    const hashed = await bcrypt.hash(matKhau, 10);

    const user = await NguoiDung.create({
      hoTen: hoTen,
      tenDangNhap: tenDangNhap,
      matKhau: hashed,
      vaiTro: vaiTro,
    });

    res.status(201).json({
      status: true,
      message: "Tạo tài khoản nhân viên thành công",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.dangNhap = async (req, res) => {
  const { tenDangNhap, matKhau } = req.body;
  try {
    const user = await NguoiDung.findOne({ tenDangNhap: tenDangNhap });
    if (!user) {
      return res.status(401).json({
        message: "Tên đăng nhập hoặc mật khẩu không đúng",
      });
    }

    const validPwd = await bcrypt.compare(matKhau, user.matKhau);
    if (!validPwd) {
      return res.status(401).json({
        message: "Tên đăng nhập hoặc mật khẩu không đúng",
      });
    }

    req.session.user = {
      id: user._id,
      tenDangNhap: user.tenDangNhap,
      hoTen: user.hoTen,
      vaiTro: user.vaiTro,
    };

    res.json({
      user: req.session.user,
      message: "Đăng nhập thành công",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.dangXuat = (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          message: "Đăng xuất thất bại",
        });
      }
      res.clearCookie("connect.sid");
      return res.json({
        message: "Đăng xuất thành công",
      });
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
