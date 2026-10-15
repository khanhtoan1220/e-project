const BanAn = require("../models/banAn.model");
const HoaDon = require("../models/hoaDon.model");
const Menu = require("../models/menu.model");
const HoTro = require("../models/hoTro.model");
const pusher = require("../config/pusher"); // 1. Import Pusher

exports.layCauHinhThanhToan = async (req, res) => {
  const maNganHang = process.env.VIETQR_BANK_ID;
  const soTaiKhoan = process.env.VIETQR_ACCOUNT_NO;
  const tenChuTaiKhoan = process.env.VIETQR_ACCOUNT_NAME;
  if (!maNganHang || !soTaiKhoan || !tenChuTaiKhoan) {
    return res
      .status(503)
      .json({ message: "Chưa cấu hình tài khoản nhận tiền." });
  }
  res.json({ maNganHang, soTaiKhoan, tenChuTaiKhoan });
};

exports.laySoDoBan = async (req, res) => {
  try {
    await BanAn.updateMany(
      { trangThai: "choDonDep" },
      { trangThai: "trong" },
    ).exec();
    const list = await BanAn.find().populate("hoaDon").exec();
    res.json(list);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.goiMon = async (req, res) => {
  try {
    const { chonMon } = req.body;
    const laKhach = !!req.hoaDonKhach;
    const hoaDon = laKhach
      ? req.hoaDonKhach
      : await HoaDon.findById(req.body.hoaDonId).populate("banId");
    if (
      !hoaDon ||
      hoaDon.trangThai !== "chuaThanhToan" ||
      !hoaDon.banId ||
      hoaDon.banId.trangThai !== "dangSuDung" ||
      String(hoaDon.banId.hoaDon) !== String(hoaDon._id)
    ) {
      return res.status(409).json({ message: "Hóa đơn không còn phục vụ." });
    }
    if (hoaDon.trangThaiThanhToan === "choThanhToan") {
      return res.status(409).json({
        message:
          "Hóa đơn đã chốt. Hoàn tất yêu cầu thanh toán trước khi gọi thêm món.",
      });
    }
    if (
      !Array.isArray(chonMon) ||
      chonMon.length === 0 ||
      chonMon.length > 100
    ) {
      return res
        .status(400)
        .json({ message: "Vui lòng chọn từ 1 đến 100 dòng món." });
    }
    const danhSachMon = [];
    let thanhTien = 0;
    for (const item of chonMon) {
      if (
        !item ||
        !Number.isSafeInteger(item.soLuong) ||
        item.soLuong < 1 ||
        item.soLuong > 100 ||
        (item.ghiChu != null &&
          (typeof item.ghiChu !== "string" || item.ghiChu.length > 500))
      ) {
        return res.status(400).json({
          message: "Số lượng phải từ 1 đến 100, ghi chú tối đa 500 ký tự.",
        });
      }
      const mon = await Menu.findById(item.menuId);
      if (!mon || !mon.conBan) {
        return res
          .status(400)
          .json({ message: "Có món không còn bán, vui lòng chọn lại." });
      }
      danhSachMon.push({
        menuId: mon._id,
        ten: mon.ten,
        gia: mon.gia,
        soLuong: item.soLuong,
        ghiChu: item.ghiChu,
        canNao: mon.canNao,
        trangThaiMon: laKhach
          ? "choXacNhan"
          : mon.canNao === false
            ? "daXong"
            : "choCheBien",
      });
      thanhTien += mon.gia * item.soLuong;
    }
    const dieuKien = {
      _id: hoaDon._id,
      trangThai: "chuaThanhToan",
      banId: hoaDon.banId._id,
    };
    const capNhat = await HoaDon.findOneAndUpdate(
      dieuKien,
      {
        $push: { danhSachMon: { $each: danhSachMon } },
        $inc: { tongTien: thanhTien, __v: 1 },
      },
      { returnDocument: "after", runValidators: true },
    );
    if (!capNhat)
      return res
        .status(409)
        .json({ message: "Bàn hoặc hóa đơn đã thay đổi. Vui lòng tải lại." });
    const suKien = {
      message: "Bàn " + hoaDon.banId.ten + " vừa gọi thêm món.",
      hoaDonId: hoaDon._id,
      banId: hoaDon.banId._id,
    };
    if (laKhach) {
      pusher.trigger("nhan-vien-channel", "yeu-cau-moi", suKien);
    }
    if (
      !laKhach &&
      danhSachMon.some((mon) => mon.trangThaiMon === "choCheBien")
    ) {
      pusher.trigger("bep-channel", "co-don-moi", suKien);
    }
    res.json(capNhat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getHoaDonTheoBan = async (req, res) => {
  try {
    const idBan = req.params.id;
    const p = await HoaDon.findOne({ banId: idBan, trangThai: "chuaThanhToan" })
      .populate("banId")
      .exec();
    if (p) {
      res.json(p);
    } else {
      res
        .status(404)
        .json({ message: "Bàn này hiện không có hóa đơn chưa thanh toán" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.thanhToan = async (req, res) => {
  try {
    const { hoaDonId } = req.body;
    const hoaDon = await HoaDon.findById(hoaDonId).exec();
    if (!hoaDon) {
      return res.status(404).json({ message: "Hóa đơn không tồn tại" });
    }
    if (hoaDon.trangThaiThanhToan === "choChot") {
      return res.status(409).json({
        message:
          "Khách đã yêu cầu thanh toán. Hãy kiểm tra và chốt hóa đơn trong mục Yêu cầu hỗ trợ trước.",
      });
    }

    const conMonChuaHoanThanh = hoaDon.danhSachMon.some(
      (mon) =>
        !["daXong", "daPhucVu", "daHuy", "daTra"].includes(mon.trangThaiMon),
    );
    if (conMonChuaHoanThanh) {
      return res.status(400).json({
        message:
          "Không thể thanh toán vì vẫn còn món đang chờ xác nhận hoặc chế biến.",
      });
    }

    const daThanhToan = await HoaDon.findOneAndUpdate(
      {
        _id: hoaDon._id,
        trangThai: "chuaThanhToan",
        danhSachMon: {
          $not: {
            $elemMatch: {
              trangThaiMon: { $nin: ["daXong", "daPhucVu", "daHuy", "daTra"] },
            },
          },
        },
      },
      {
        trangThai: "daThanhToan",
        trangThaiThanhToan: "daThanhToan",
        thoiGianRa: new Date(),
      },
      { returnDocument: "after" },
    );
    if (!daThanhToan) {
      return res
        .status(409)
        .json({ message: "Hóa đơn đã kết thúc hoặc có món mới chưa phục vụ." });
    }
    await BanAn.findOneAndUpdate(
      { _id: daThanhToan.banId, hoaDon: hoaDon._id },
      {
        trangThai: "trong",
        hoaDon: null,
      },
    );
    await HoTro.updateMany(
      {
        hoaDonId: hoaDon._id,
        loaiYeuCau: "thanhToan",
        trangThai: { $in: ["choXuLy", "dangXuLy"] },
      },
      { trangThai: "hoanTat", ketQuaXuLy: "chapNhan" },
    );

    res.json({ message: "Thanh toán thành công", hoaDon: daThanhToan });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.chuyenBan = async (req, res) => {
  try {
    const { banCuId, banMoiId } = req.body;

    if (banCuId === banMoiId) {
      return res
        .status(400)
        .json({ message: "Bàn mới phải khác bàn hiện tại" });
    }

    const [banCu, banMoi] = await Promise.all([
      BanAn.findById(banCuId),
      BanAn.findById(banMoiId),
    ]);

    if (!banCu || !banMoi) {
      return res.status(404).json({ message: "Không tìm thấy bàn cần chuyển" });
    }

    if (banCu.trangThai !== "dangSuDung" || !banCu.hoaDon) {
      return res
        .status(400)
        .json({ message: "Bàn cũ hiện không có khách đang sử dụng" });
    }

    if (banMoi.trangThai !== "trong") {
      return res
        .status(400)
        .json({ message: "Bàn chuyển đến không còn trống" });
    }

    const hoaDonId = banCu.hoaDon;

    await HoaDon.findByIdAndUpdate(hoaDonId, { banId: banMoiId });

    banMoi.trangThai = "dangSuDung";
    banMoi.hoaDon = hoaDonId;
    await banMoi.save();

    banCu.trangThai = "trong";
    banCu.hoaDon = null;
    await banCu.save();

    pusher.trigger("nhan-vien-channel", "chuyen-ban", {
      message: `Đã chuyển từ [${banCu.ten}] sang [${banMoi.ten}]`,
      banCuId,
      banMoiId,
    });

    res.json({
      message: `Chuyển từ bàn [${banCu.ten}] sang bàn [${banMoi.ten}] thành công`,
      banMoi,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.duyetMonAnKhachGoi = async (req, res) => {
  try {
    const { hoaDonId } = req.body;
    const hoaDon = await HoaDon.findById(hoaDonId).populate("banId").exec();
    if (!hoaDon)
      return res.status(404).json({ message: "Không tìm thấy hóa đơn" });

    let coMonDuyet = false;
    let coMonBaoBep = false;
    let coMonKhongCanNao = false;

    hoaDon.danhSachMon.forEach((mon) => {
      if (mon.trangThaiMon === "choXacNhan") {
        if (mon.canNao === false) {
          mon.trangThaiMon = "daXong";
          coMonKhongCanNao = true;
        } else {
          mon.trangThaiMon = "choCheBien";
          coMonBaoBep = true;
        }
        coMonDuyet = true;
      }
    });

    if (!coMonDuyet) {
      return res
        .status(400)
        .json({ message: "Không có món ăn nào đang chờ duyệt tại bàn này!" });
    }

    await hoaDon.save();

    if (coMonBaoBep) {
      pusher.trigger("bep-channel", "co-don-moi", {
        message: `Đơn gọi món tại [${hoaDon.banId.ten}] đã được phục vụ duyệt, bắt đầu chế biến!`,
        hoaDonId: hoaDon._id,
      });
    }
    if (coMonKhongCanNao) {
      pusher.trigger("nhan-vien-channel", "yeu-cau-moi", {
        message: `Món không cần chế biến tại [${hoaDon.banId.ten}] đã được nhân viên xác nhận.`,
        banId: hoaDon.banId._id,
        hoaDonId: hoaDon._id,
      });
    }
    res.json({ message: "Đã duyệt gửi món ăn xuống Bếp thành công!", hoaDon });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
