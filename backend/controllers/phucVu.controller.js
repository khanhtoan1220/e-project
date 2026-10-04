const crypto = require("crypto");
const BanAn = require("../models/banAn.model");
const HoaDon = require("../models/hoaDon.model");
const Menu = require("../models/menu.model");
const pusher = require("../config/pusher"); // 1. Import Pusher

exports.laySoDoBan = async (req, res) => {
  try {
    const list = await BanAn.find().populate("hoaDon").exec();
    res.json(list);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.moBan = async (req, res) => {
  try {
    const { banId } = req.body;
    const ban = await BanAn.findById(banId);
    if (!ban) return res.status(404).json({ message: "Không tìm thấy bàn." });
    if (!["trong", "datTruoc"].includes(ban.trangThai)) {
      return res.status(409).json({ message: "Bàn chưa sẵn sàng để mở." });
    }
    const hoaDon = await HoaDon.create({ banId, danhSachMon: [] });
    try {
      const capNhat = await BanAn.findOneAndUpdate(
        { _id: banId, trangThai: ban.trangThai, hoaDon: ban.hoaDon || null },
        { trangThai: "dangSuDung", hoaDon: hoaDon._id },
        { new: true, runValidators: true },
      );
      if (!capNhat) {
        await HoaDon.findByIdAndDelete(hoaDon._id);
        return res.status(409).json({ message: "Bàn đã được nhân viên khác cập nhật." });
      }
    } catch (error) {
      await HoaDon.findByIdAndDelete(hoaDon._id);
      throw error;
    }
    res.status(201).json(hoaDon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.taoQr = async (req, res) => {
  try {
    const hoaDon = await HoaDon.findById(req.params.hoaDonId).populate("banId");
    if (!hoaDon || hoaDon.trangThai !== "chuaThanhToan" ||
        !hoaDon.banId || hoaDon.banId.trangThai !== "dangSuDung" ||
        String(hoaDon.banId.hoaDon) !== String(hoaDon._id)) {
      return res.status(409).json({ message: "Hóa đơn không còn phục vụ." });
    }
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000);
    const accessUrl = new URL("/goi-mon", process.env.CUSTOMER_FRONTEND_URL || "http://localhost:5175");
    accessUrl.hash = new URLSearchParams({ token }).toString();
    const capNhat = await HoaDon.findOneAndUpdate(
      { _id: hoaDon._id, trangThai: "chuaThanhToan" },
      { qrTokenHash: tokenHash, qrHetHan: expiresAt },
      { new: true },
    );
    if (!capNhat) return res.status(409).json({ message: "Hóa đơn đã kết thúc." });
    res.set("Cache-Control", "no-store");
    res.json({ accessUrl: accessUrl.toString(), expiresAt });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.goiMon = async (req, res) => {
  try {
    const { chonMon } = req.body;
    const laKhach = !!req.hoaDonKhach;
    const hoaDon = laKhach ? req.hoaDonKhach :
      await HoaDon.findById(req.body.hoaDonId).populate("banId");
    if (!hoaDon || hoaDon.trangThai !== "chuaThanhToan" ||
        !hoaDon.banId || hoaDon.banId.trangThai !== "dangSuDung" ||
        String(hoaDon.banId.hoaDon) !== String(hoaDon._id)) {
      return res.status(409).json({ message: "Hóa đơn không còn phục vụ." });
    }
    if (!Array.isArray(chonMon) || chonMon.length === 0 || chonMon.length > 100) {
      return res.status(400).json({ message: "Vui lòng chọn từ 1 đến 100 dòng món." });
    }
    const danhSachMon = [];
    let thanhTien = 0;
    for (const item of chonMon) {
      if (!item || !Number.isSafeInteger(item.soLuong) || item.soLuong < 1 || item.soLuong > 100 ||
          (item.ghiChu != null && (typeof item.ghiChu !== "string" || item.ghiChu.length > 500))) {
        return res.status(400).json({ message: "Số lượng phải từ 1 đến 100, ghi chú tối đa 500 ký tự." });
      }
      const mon = await Menu.findById(item.menuId);
      if (!mon || !mon.conBan) {
        return res.status(400).json({ message: "Có món không còn bán, vui lòng chọn lại." });
      }
      danhSachMon.push({
        menuId: mon._id, ten: mon.ten, gia: mon.gia, soLuong: item.soLuong,
        ghiChu: item.ghiChu, canNao: mon.canNao,
        trangThaiMon: laKhach ? "choXacNhan" : mon.canNao === false ? "daXong" : "choCheBien",
      });
      thanhTien += mon.gia * item.soLuong;
    }
    const dieuKien = { _id: hoaDon._id, trangThai: "chuaThanhToan", banId: hoaDon.banId._id };
    if (laKhach) {
      dieuKien.qrTokenHash = req.qrTokenHash;
      dieuKien.qrHetHan = { $gt: new Date() };
    }
    const capNhat = await HoaDon.findOneAndUpdate(dieuKien, {
      $push: { danhSachMon: { $each: danhSachMon } },
      $inc: { tongTien: thanhTien, __v: 1 },
    }, { new: true, runValidators: true });
    if (!capNhat) return res.status(409).json({ message: "QR hoặc hóa đơn đã thay đổi. Vui lòng tải lại." });
    pusher.trigger(laKhach ? "nhan-vien-channel" : "bep-channel",
      laKhach ? "yeu-cau-moi" : "co-don-moi",
      { message: "Bàn " + hoaDon.banId.ten + " vừa gọi thêm món.", hoaDonId: hoaDon._id, banId: hoaDon.banId._id }
    ).catch(console.error);
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

    // Kiểm tra chặt chẽ: Toàn bộ các món ăn trong hóa đơn phải được giải quyết (Đã bưng 'daPhucVu' hoặc Đã hủy 'daHuy')
    // Nếu còn bất kỳ món nào có trạng thái khác (đang chờ bếp 'choXacNhan', đang nấu 'dangLam', hoặc bếp xong nhưng chưa bưng 'daXong') -> Chặn thanh toán
    const conMonChuaHoanThanh = hoaDon.danhSachMon.some(
      (mon) => mon.trangThaiMon !== "daPhucVu" && mon.trangThaiMon !== "daHuy",
    );
    if (conMonChuaHoanThanh) {
      return res.status(400).json({
        message:
          "Không thể thanh toán! Bàn ăn vẫn còn món chưa phục vụ xong. Vui lòng xác nhận 'Đã bưng' các món đã nấu xong, hoặc hủy các món chưa chế biến trước khi tính tiền.",
      });
    }

    const daThanhToan = await HoaDon.findOneAndUpdate(
      { _id: hoaDon._id, trangThai: "chuaThanhToan",
        danhSachMon: { $not: { $elemMatch: { trangThaiMon: { $nin: ["daPhucVu", "daHuy"] } } } } },
      { trangThai: "daThanhToan", thoiGianRa: new Date(), qrTokenHash: null, qrHetHan: null },
      { new: true },
    );
    if (!daThanhToan) {
      return res.status(409).json({ message: "Hóa đơn đã kết thúc hoặc có món mới chưa phục vụ." });
    }
    await BanAn.findOneAndUpdate({ _id: daThanhToan.banId, hoaDon: hoaDon._id }, {
      trangThai: "choDonDep", hoaDon: null,
    });

    pusher.trigger("nhan-vien-channel", "yeu-cau-don-ban", {
      message: `Khách đã thanh toán, vui lòng dọn dẹp bàn!`,
      banId: hoaDon.banId,
    });

    res.json({ message: "Thanh toán thành công", hoaDon: daThanhToan });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.hoanTatDonBan = async (req, res) => {
  try {
    const idBan = req.params.id;
    const ban = await BanAn.findById(idBan).exec();

    if (!ban) {
      return res.status(404).json({ message: "Không tìm thấy bàn dọn dẹp" });
    }

    if (ban.trangThai !== "choDonDep") {
      return res
        .status(400)
        .json({ message: "Bàn này hiện không ở trạng thái chờ dọn dẹp" });
    }

    ban.trangThai = "trong";
    await ban.save();

    res.json({ message: "Dọn dẹp bàn thành công, bàn đã trống", data: ban });
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

// Phục vụ xác nhận đã bưng món ra cho khách (daXong -> daPhucVu)
exports.xacNhanPhucVuMon = async (req, res) => {
  try {
    const { hoaDonId, monItemObjectId } = req.body;
    const hoaDon = await HoaDon.findById(hoaDonId).exec();
    if (!hoaDon) return res.status(404).json({ message: "Không thấy hóa đơn" });

    const monItem = hoaDon.danhSachMon.id(monItemObjectId);
    if (!monItem)
      return res
        .status(404)
        .json({ message: "Không tìm thấy món ăn trong đơn" });

    if (monItem.trangThaiMon !== "daXong") {
      return res.status(400).json({
        message: "Chỉ có thể xác nhận bưng những món bếp đã nấu xong!",
      });
    }

    monItem.trangThaiMon = "daPhucVu";
    await hoaDon.save();
    res.json({ message: `Đã xác nhận phục vụ món "${monItem.ten}" lên bàn!` });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Phục vụ xác nhận duyệt các món khách tự gọi qua QR để gửi xuống Bếp (choXacNhan -> choCheBien)
exports.duyetMonAnKhachGoi = async (req, res) => {
  try {
    const { hoaDonId } = req.body;
    const hoaDon = await HoaDon.findById(hoaDonId).populate("banId").exec();
    if (!hoaDon)
      return res.status(404).json({ message: "Không tìm thấy hóa đơn" });

    let coMonDuyet = false;
    let coMonBaoBep = false; // Nhận biết xem có cần bắn thông báo cho bếp hay không

    hoaDon.danhSachMon.forEach((mon) => {
      if (mon.trangThaiMon === "choXacNhan") {
        if (mon.canNao === false) {
          // Đồ uống/món ăn liền không cần nấu -> chuyển thẳng sang daXong chờ phục vụ bưng
          mon.trangThaiMon = "daXong";
        } else {
          // Món cần nấu -> chuyển sang choCheBien báo bếp
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

    // Chỉ búng Realtime cho bếp nếu trong đơn hàng có món cần đầu bếp chế biến
    if (coMonBaoBep) {
      pusher.trigger("bep-channel", "co-don-moi", {
        message: `Đơn gọi món tại [${hoaDon.banId.ten}] đã được phục vụ duyệt, bắt đầu chế biến!`,
        hoaDonId: hoaDon._id,
      });
    } else {
      // Nếu chỉ có đồ uống, búng thông báo nội bộ báo phục vụ tự lấy bia nước ngọt bưng ra cho khách
      pusher.trigger("nhan-vien-channel", "yeu-cau-moi", {
        message: `Đồ uống tại [${hoaDon.banId.ten}] đã được duyệt, phục vụ vui lòng tự lấy tủ bưng ra bàn!`,
        banId: hoaDon.banId,
      });
    }

    res.json({ message: "Đã duyệt gửi món ăn xuống Bếp thành công!", hoaDon });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
