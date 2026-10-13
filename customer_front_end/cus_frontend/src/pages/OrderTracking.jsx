import { useEffect, useState } from "react";
import api from "../services/api";

const trangThaiMon = {
  choXacNhan: { ten: "Chờ nhân viên xác nhận", mau: "waiting" },
  choCheBien: { ten: "Đang chờ bếp nhận đơn", mau: "waiting" },
  dangLam: { ten: "Đang chế biến", mau: "cooking" },
  daXong: { ten: "Món đã hoàn thành", mau: "completed" },
  daPhucVu: { ten: "Món đã hoàn thành", mau: "completed" },
  daHuy: { ten: "Món đã hủy", mau: "cancelled" },
  daTra: { ten: "Đã trả", mau: "cancelled" },
};

function OrderTracking({ ban, hoaDon, danhSachYeuCauTraMon = [], danhSachYeuCauThanhToan = [], loading, onRefresh, onOrderMore, onRequestReturn, onRequestPayment }) {
  const [soLuongTra, setSoLuongTra] = useState({});
  const [lyDoTra, setLyDoTra] = useState({});
  const [dangGuiId, setDangGuiId] = useState("");
  const danhSachMon = hoaDon?.danhSachMon || [];
  const tongTien = Number(hoaDon?.tongTien || 0);
  const [cauHinhThanhToan, setCauHinhThanhToan] = useState(null);
  useEffect(() => {
    api.get("/khach-hang/cau-hinh-thanh-toan")
      .then((response) => setCauHinhThanhToan(response.data))
      .catch(() => setCauHinhThanhToan(null));
  }, []);
  const maNganHang = cauHinhThanhToan?.maNganHang;
  const soTaiKhoan = cauHinhThanhToan?.soTaiKhoan;
  const tenChuTaiKhoan = cauHinhThanhToan?.tenChuTaiKhoan;
  const noiDungChuyenKhoan = hoaDon?._id ? `HD${String(hoaDon._id).slice(-8).toUpperCase()}` : "";
  const qrThanhToan = maNganHang && soTaiKhoan && tenChuTaiKhoan && tongTien > 0
    ? `https://img.vietqr.io/image/${encodeURIComponent(maNganHang)}-${encodeURIComponent(soTaiKhoan)}-compact2.png?amount=${encodeURIComponent(tongTien)}&addInfo=${encodeURIComponent(noiDungChuyenKhoan)}&accountName=${encodeURIComponent(tenChuTaiKhoan)}`
    : "";
  const yeuCauThanhToanDangCho = danhSachYeuCauThanhToan.some((yeuCau) => yeuCau.trangThai === "choXuLy");
  const conMonChuaHoanThanh = danhSachMon.some((mon) => !["daXong", "daPhucVu", "daHuy", "daTra"].includes(mon.trangThaiMon));

  const guiYeuCauTra = async (mon) => {
    const soLuong = Number(soLuongTra[mon._id] || 1);
    const lyDo = (lyDoTra[mon._id] || "").trim();
    if (!lyDo) return;
    setDangGuiId(mon._id);
    try {
      const daGui = await onRequestReturn(mon._id, soLuong, lyDo);
      if (daGui) setLyDoTra((hienTai) => ({ ...hienTai, [mon._id]: "" }));
    } finally {
      setDangGuiId("");
    }
  };

  return (
    <main className="order-tracking-page">
      <div className="tracking-heading">
        <div>
          <span className="page-label">THEO DÕI ĐƠN VÀ HÓA ĐƠN</span>
          <h2>{ban?.ten || "Bàn ăn"}{ban?.khuVuc ? ` · ${ban.khuVuc.replace("tang", "Tầng ")}` : ""}</h2>
          <p>Trạng thái món tự cập nhật trong khi bạn dùng bữa.</p>
        </div>
        <button type="button" className="secondary-button" onClick={onRefresh} disabled={loading}>Cập nhật</button>
      </div>

      <section className="receipt-sheet" aria-label="Hóa đơn hiện tại">
        <header className="receipt-heading">
          <div><span className="page-label">HÓA ĐƠN TẠI BÀN</span><h3>{ban?.ten || "Bàn ăn"}</h3></div>
          <small>Mã hóa đơn: {hoaDon?._id ? String(hoaDon._id).slice(-8).toUpperCase() : "Chưa có"}</small>
        </header>
        <section className="order-list" aria-label="Các món đã gọi">
        {danhSachMon.length === 0 ? (
          <div className="empty-order-state">
            <h3>Bàn chưa có món được gọi</h3>
            <p>Chọn món trong thực đơn để bắt đầu.</p>
          </div>
        ) : danhSachMon.map((mon) => {
          const trangThai = trangThaiMon[mon.trangThaiMon] || { ten: mon.trangThaiMon, mau: "waiting" };
          return (
            <article className="order-item" key={mon._id}>
              <div className="order-item-main">
                <h3>{mon.ten}</h3>
                <p>Số lượng: {mon.soLuong}{mon.ghiChu ? ` · Ghi chú: ${mon.ghiChu}` : ""}</p>
                <strong>{(Number(mon.gia || 0) * Number(mon.soLuong || 0)).toLocaleString("vi-VN")} đ</strong>
              </div>
              <span className={`order-status status-${trangThai.mau}`}>{trangThai.ten}</span>
              {["daXong", "daPhucVu"].includes(mon.trangThaiMon) && mon.soLuong > 0 && (() => {
                const dangCho = danhSachYeuCauTraMon
                  .filter((yeuCau) => yeuCau.monHoaDonId === mon._id && yeuCau.trangThai === "choXuLy")
                  .reduce((tong, yeuCau) => tong + Number(yeuCau.soLuongTra || 0), 0);
                const conLai = Math.max(0, mon.soLuong - dangCho);
                return conLai > 0 ? <div className="return-request-form">
                  <label>Số lượng muốn trả
                    <input type="number" min="1" max={conLai} step="1"
                      value={soLuongTra[mon._id] || 1}
                      onChange={(event) => setSoLuongTra((hienTai) => ({ ...hienTai, [mon._id]: event.target.value }))} />
                  </label>
                  <label>Lý do trả
                    <input type="text" maxLength="300" required placeholder="Ví dụ: còn nguyên, chưa dùng"
                      value={lyDoTra[mon._id] || ""}
                      onChange={(event) => setLyDoTra((hienTai) => ({ ...hienTai, [mon._id]: event.target.value }))} />
                  </label>
                  <button type="button" className="secondary-button" disabled={dangGuiId === mon._id || !lyDoTra[mon._id]?.trim()}
                    onClick={() => guiYeuCauTra(mon)}>
                    {dangGuiId === mon._id ? "Đang gửi..." : "Yêu cầu trả món"}
                  </button>
                  {dangCho > 0 && <small>Đang chờ nhân viên xác nhận {dangCho} món.</small>}
                </div> : null;
              })()}
            </article>
          );
        })}
      </section>

        <footer className="receipt-total"><span>Tổng cộng · tạm tính</span><strong>{tongTien.toLocaleString("vi-VN")} đ</strong></footer>
        {hoaDon?._id && <section className="invoice-payment-qr" aria-label="Mã QR thanh toán">
          <h4>Quét mã QR để chuyển khoản</h4>
          {qrThanhToan ? <>
            <img src={qrThanhToan} alt={`Mã QR chuyển ${tongTien.toLocaleString("vi-VN")} đồng`} />
            <p>Ngân hàng sẽ điền sẵn số tiền <strong>{tongTien.toLocaleString("vi-VN")} đ</strong> và nội dung <strong>{noiDungChuyenKhoan}</strong>.</p>
          </> : <p>Chưa có số tiền cần thanh toán để tạo QR.</p>}
        </section>}
      </section>

      {danhSachYeuCauTraMon.length > 0 && <section className="return-request-history">
        <h3>Yêu cầu trả món</h3>
        {danhSachYeuCauTraMon.map((yeuCau) => <p key={yeuCau._id}>
          {yeuCau.soLuongTra} × {yeuCau.tenMon}: {yeuCau.trangThai === "choXuLy" ? "Đang chờ nhân viên xác nhận" : yeuCau.ketQuaXuLy === "chapNhan" ? `Đã chấp nhận · hoàn ${Number(yeuCau.giaHoanTra || 0).toLocaleString("vi-VN")}đ` : "Nhân viên đã từ chối"}
        </p>)}
      </section>}

      {ban?.trangThai === "dangSuDung" && hoaDon?._id && <section className="payment-request-card">
        {yeuCauThanhToanDangCho ? (
          <p>Đã gửi yêu cầu thanh toán. Nhân viên sẽ kiểm tra hóa đơn và xác nhận đã nhận tiền.</p>
        ) : <>
          <p>Kiểm tra tổng tiền rồi yêu cầu nhân viên thanh toán tại bàn.</p>
          <button type="button" className="primary-button" disabled={loading || conMonChuaHoanThanh}
            onClick={onRequestPayment}>Yêu cầu thanh toán</button>
          {conMonChuaHoanThanh && <small>Món đang chờ xác nhận hoặc chế biến xong trước khi thanh toán.</small>}
        </>}
      </section>}

      <button type="button" className="primary-button" onClick={onOrderMore}>Gọi thêm món</button>
    </main>
  );
}

export default OrderTracking;
