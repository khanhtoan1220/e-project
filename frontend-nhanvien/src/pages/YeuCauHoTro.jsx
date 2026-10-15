import { useCallback, useEffect, useState } from "react";
import { Alert, Badge, Button, Card, Modal, Spinner } from "react-bootstrap";
import {
  get_danhsach_hotro_service,
  get_cau_hinh_thanh_toan_service,
  xac_nhan_hotro_service,
} from "../services/staff_service";

const tenLoaiYeuCau = {
  goiNhanVien: "Gọi nhân viên",
  themDungCu: "Thêm dụng cụ",
  themNuoc: "Thêm nước",
  thanhToan: "Yêu cầu thanh toán",
  traMon: "Yêu cầu trả món",
  khac: "Yêu cầu khác",
};

const layUrlQrThanhToan = (hoaDon, cauHinh) => {
  const maNganHang = cauHinh?.maNganHang;
  const soTaiKhoan = cauHinh?.soTaiKhoan;
  const tenChuTaiKhoan = cauHinh?.tenChuTaiKhoan;
  const tongTien = Number(hoaDon?.soTienThanhToan || 0);
  if (hoaDon?.trangThaiThanhToan !== "choThanhToan" || !maNganHang || !soTaiKhoan || !tenChuTaiKhoan || tongTien <= 0 || !hoaDon?._id) return "";

  const noiDung = `HD${String(hoaDon._id).slice(-8).toUpperCase()}`;
  return `https://img.vietqr.io/image/${encodeURIComponent(maNganHang)}-${encodeURIComponent(soTaiKhoan)}-compact2.png?amount=${encodeURIComponent(tongTien)}&addInfo=${encodeURIComponent(noiDung)}&accountName=${encodeURIComponent(tenChuTaiKhoan)}`;
};

export default function YeuCauHoTro() {
  const [danhSach, setDanhSach] = useState([]);
  const [dangTai, setDangTai] = useState(true);
  const [dangXuLyId, setDangXuLyId] = useState("");
  const [loi, setLoi] = useState("");
  const [thongBao, setThongBao] = useState("");
  const [yeuCauQr, setYeuCauQr] = useState(null);
  const [cauHinhThanhToan, setCauHinhThanhToan] = useState(null);

  const taiDanhSach = useCallback(async (hienThiLoading = false) => {
    try {
      if (hienThiLoading) setDangTai(true);
      setLoi("");
      setDanhSach(await get_danhsach_hotro_service());
    } catch (error) {
      setLoi(String(error));
    } finally {
      setDangTai(false);
    }
  }, []);

  useEffect(() => {
    taiDanhSach(true);
    get_cau_hinh_thanh_toan_service().then(setCauHinhThanhToan).catch(() => setCauHinhThanhToan(null));
    const intervalId = window.setInterval(() => taiDanhSach(), 5000);
    return () => window.clearInterval(intervalId);
  }, [taiDanhSach]);

  const hoanTatYeuCau = async (id, ketQua) => {
    try {
      const yeuCau = danhSach.find((item) => item._id === id);
      setDangXuLyId(id);
      setLoi("");
      await xac_nhan_hotro_service(id, ketQua);
      if (yeuCau?.loaiYeuCau === "thanhToan" && ketQua === "chotDon") {
        await taiDanhSach();
      } else {
        setDanhSach((hienTai) => hienTai.filter((item) => item._id !== id));
      }
      setThongBao(yeuCau?.loaiYeuCau === "thanhToan" && ketQua === "chotDon"
        ? "Đã chốt hóa đơn và tạo mã QR. Chờ khách chuyển khoản rồi xác nhận đã nhận tiền."
        : yeuCau?.loaiYeuCau === "thanhToan" && ketQua === "chapNhan"
        ? "Đã xác nhận thanh toán; bàn đã chuyển về trạng thái trống."
        : yeuCau?.loaiYeuCau === "thanhToan"
          ? "Đã đóng yêu cầu; hóa đơn vẫn chưa thanh toán."
          : yeuCau?.loaiYeuCau === "traMon" && ketQua === "chapNhan"
            ? "Đã chấp nhận trả món và cập nhật hóa đơn."
            : yeuCau?.loaiYeuCau === "traMon" && ketQua === "tuChoi"
              ? "Đã từ chối yêu cầu trả món."
              : "Đã đánh dấu yêu cầu là xử lý xong.");
    } catch (error) {
      setLoi(String(error));
    } finally {
      setDangXuLyId("");
    }
  };

  const qrDangMo = layUrlQrThanhToan(yeuCauQr?.hoaDonId, cauHinhThanhToan);
  const tongTienQr = Number(yeuCauQr?.hoaDonId?.soTienThanhToan || 0);
  const maHoaDonQr = yeuCauQr?.hoaDonId?._id
    ? `HD${String(yeuCauQr.hoaDonId._id).slice(-8).toUpperCase()}`
    : "";

  return (
    <section className="staff-page">
      <div className="page-heading">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">Yêu cầu hỗ trợ</h1>
          <div className="text-muted small">
            Yêu cầu khách gửi từ mã QR sẽ xuất hiện tại đây. Danh sách tự cập nhật mỗi 5 giây.
          </div>
        </div>
        <Button variant="outline-secondary" size="sm" onClick={() => taiDanhSach(true)}>
          Tải lại
        </Button>
      </div>

      {thongBao && <Alert variant="success" dismissible onClose={() => setThongBao("")}>{thongBao}</Alert>}
      {loi && <Alert variant="danger" dismissible onClose={() => setLoi("")}>{loi}</Alert>}

      {dangTai ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="secondary" />
          <p className="text-secondary mt-2">Đang tải yêu cầu...</p>
        </div>
      ) : danhSach.length === 0 ? (
        <div className="empty-state">Hiện không có yêu cầu hỗ trợ nào đang chờ.</div>
      ) : (
        <div className="d-grid gap-3">
          {danhSach.map((item) => (
            <Card key={item._id} className="border-0 shadow-sm">
              <Card.Body className="d-flex flex-column flex-md-row justify-content-between gap-3">
                <div>
                  <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                    <h2 className="h5 mb-0">Bàn {item.banId?.ten || "không rõ"}</h2>
                    <Badge bg={item.trangThai === "dangXuLy" ? "info" : "warning"} text="dark">
                      {item.trangThai === "dangXuLy" ? "Đã chốt · chờ thanh toán" : "Đang chờ"}
                    </Badge>
                    <Badge bg="light" text="dark" className="border">
                      {tenLoaiYeuCau[item.loaiYeuCau] || item.loaiYeuCau}
                    </Badge>
                  </div>
                  {item.noiDung && <p className="mb-2">{item.noiDung}</p>}
                  {item.loaiYeuCau === "traMon" && <p className="mb-2 fw-semibold">
                    Khách yêu cầu trả {item.soLuongTra} × {item.tenMon}
                    {(() => {
                      const mon = item.hoaDonId?.danhSachMon?.find((dongMon) => String(dongMon._id) === String(item.monHoaDonId));
                      return mon ? ` · dự kiến hoàn ${Number(mon.gia * item.soLuongTra).toLocaleString("vi-VN")}đ` : "";
                    })()}
                  </p>}
                  {item.loaiYeuCau === "thanhToan" && <section className="support-payment-receipt">
                    <h3>Hóa đơn bàn {item.banId?.ten}</h3>
                    <small>Mã hóa đơn: {item.hoaDonId?._id ? String(item.hoaDonId._id).slice(-8).toUpperCase() : "Không rõ"}</small>
                    <div className="support-payment-items">
                      {item.hoaDonId?.danhSachMon?.map((mon) => <div key={mon._id}>
                        <span>{mon.ten} × {mon.soLuong}</span>
                        <strong>{Number(mon.gia * mon.soLuong).toLocaleString("vi-VN")}đ</strong>
                      </div>)}
                    </div>
                    <div className="support-payment-total">
                      <span>Tổng cộng</span>
                      <strong>{Number(item.hoaDonId?.tongTien || 0).toLocaleString("vi-VN")}đ</strong>
                    </div>
                    {item.trangThai === "dangXuLy" && layUrlQrThanhToan(item.hoaDonId, cauHinhThanhToan) ? <div className="support-payment-qr">
                      <img src={layUrlQrThanhToan(item.hoaDonId, cauHinhThanhToan)} alt={`Mã QR thanh toán ${Number(item.hoaDonId?.soTienThanhToan || 0).toLocaleString("vi-VN")} đồng`} />
                      <Button variant="outline-secondary" size="sm" onClick={() => setYeuCauQr(item)}>
                        Phóng to mã QR cho khách quét
                      </Button>
                    </div> : item.trangThai === "dangXuLy"
                      ? <p className="small text-secondary mb-0">Hóa đơn đã chốt nhưng chưa tạo được mã QR. Vui lòng kiểm tra cấu hình nhận tiền.</p>
                      : <p className="small text-secondary mb-0">Kiểm tra hóa đơn rồi chốt để tạo mã QR thanh toán.</p>}
                  </section>}
                  <div className="small text-secondary">
                    Gửi lúc: {item.createdAt ? new Date(item.createdAt).toLocaleString("vi-VN") : "Không rõ"}
                  </div>
                </div>
                <div className="d-flex align-items-start gap-2 flex-wrap">
                  {item.loaiYeuCau === "traMon" ? <>
                    <Button variant="success" disabled={dangXuLyId === item._id} onClick={() => hoanTatYeuCau(item._id, "chapNhan")}>
                      {dangXuLyId === item._id ? "Đang cập nhật..." : "Chấp nhận trả"}
                    </Button>
                    <Button variant="outline-danger" disabled={dangXuLyId === item._id} onClick={() => hoanTatYeuCau(item._id, "tuChoi")}>
                      Từ chối
                    </Button>
                  </> : item.loaiYeuCau === "thanhToan" ? <>
                    {item.trangThai === "choXuLy" ? <Button variant="dark" disabled={dangXuLyId === item._id} onClick={() => hoanTatYeuCau(item._id, "chotDon")}>
                      {dangXuLyId === item._id ? "Đang chốt..." : "Chốt hóa đơn và gửi QR"}
                    </Button> : <Button variant="success" disabled={dangXuLyId === item._id} onClick={() => hoanTatYeuCau(item._id, "chapNhan")}>
                      {dangXuLyId === item._id ? "Đang cập nhật..." : "Xác nhận đã nhận tiền"}
                    </Button>}
                    <Button variant="outline-secondary" disabled={dangXuLyId === item._id} onClick={() => hoanTatYeuCau(item._id, "tuChoi")}>
                      {item.trangThai === "choXuLy" ? "Đóng yêu cầu" : "Hủy chốt hóa đơn"}
                    </Button>
                  </> : <Button
                    variant="success"
                    disabled={dangXuLyId === item._id}
                    onClick={() => hoanTatYeuCau(item._id)}
                  >
                    {dangXuLyId === item._id ? "Đang cập nhật..." : "Đánh dấu đã xử lý"}
                  </Button>}
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
      <Modal show={Boolean(yeuCauQr)} onHide={() => setYeuCauQr(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Mã QR thanh toán · Bàn {yeuCauQr?.banId?.ten}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="staff-payment-qr-modal">
          {qrDangMo ? <>
            <img src={qrDangMo} alt={`Mã QR thanh toán ${tongTienQr.toLocaleString("vi-VN")} đồng`} />
            <strong>{tongTienQr.toLocaleString("vi-VN")} đ</strong>
            <p>Nội dung chuyển khoản: {maHoaDonQr}</p>
            <small>Sau khi khách chuyển khoản, xác nhận đã nhận tiền để kết thúc hóa đơn.</small>
          </> : <p>Không tạo được mã QR cho hóa đơn này.</p>}
        </Modal.Body>
      </Modal>
    </section>
  );
}
