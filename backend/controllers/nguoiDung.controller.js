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

// Lấy thông tin user hiện tại qua Session (dùng cho Frontend khi F5)
exports.getProfile = async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }
    const user = await NguoiDung.findById(req.session.user.id).select(
      "-matKhau",
    );
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Quản lý nhân viên (Dành cho Admin)
exports.getAllNhanVien = async (req, res) => {
  try {
    const { search, vaiTro } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { hoTen: { $regex: search, $options: "i" } },
        { tenDangNhap: { $regex: search, $options: "i" } },
      ];
    }

    if (vaiTro) {
      query.vaiTro = vaiTro;
    }

    const list = await NguoiDung.find(query)
      .select("-matKhau")
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa nhân viên
exports.xoaNhanVien = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user && req.user.id === id) {
      return res
        .status(400)
        .json({ message: "Không thể tự xóa tài khoản của chính mình" });
    }
    const user = await NguoiDung.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    res.json({ message: "Xóa tài khoản nhân viên thành công" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Đổi mật khẩu cá nhân (Người dùng đang đăng nhập)
exports.doiMatKhau = async (req, res) => {
  try {
    const { matKhauCu, matKhauMoi } = req.body;
    if (!matKhauCu || !matKhauMoi) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ mật khẩu cũ và mới" });
    }
    if (matKhauMoi.length < 6) {
      return res
        .status(400)
        .json({ message: "Mật khẩu mới phải từ 6 ký tự trở lên" });
    }

    const user = await NguoiDung.findById(req.session.user.id);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    const isMatch = await bcrypt.compare(matKhauCu, user.matKhau);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Mật khẩu hiện tại không chính xác" });
    }

    user.matKhau = await bcrypt.hash(matKhauMoi, 10);
    await user.save();

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Admin đặt lại mật khẩu cho nhân viên
exports.resetMatKhau = async (req, res) => {
  try {
    const { id } = req.params;
    const { matKhauMoi } = req.body;
    if (!matKhauMoi || matKhauMoi.length < 6) {
      return res
        .status(400)
        .json({ message: "Mật khẩu mới phải từ 6 ký tự trở lên" });
    }

    const hashed = await bcrypt.hash(matKhauMoi, 10);
    const user = await NguoiDung.findByIdAndUpdate(
      id,
      { matKhau: hashed },
      { new: true },
    );
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy nhân viên" });
    }

    res.json({ message: "Đặt lại mật khẩu thành công" });
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
