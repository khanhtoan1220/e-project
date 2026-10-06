import { useState } from "react";
import api from "../services/api";

const formBanDau = {
  tenKhach: "",
  soDienThoai: "",
  nguoiLon: 2,
  treEm: 0,
  thoiGianDat: "",
  ghiChu: "",
};

function Booking() {
  const [form, setForm] = useState(formBanDau);
  const [thongTinDat, setThongTinDat] = useState(null);
  const [dangGui, setDangGui] = useState(false);
  const [error, setError] = useState("");

  const change = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setDangGui(true);
    const soNguoi = Number(form.nguoiLon) + Number(form.treEm);
    const [ngay, gio] = form.thoiGianDat.split("T");
    const thoiGianDat = new Date(form.thoiGianDat);
    if (Number.isNaN(thoiGianDat.getTime())) {
      setError("Vui lòng chọn ngày và giờ hợp lệ.");
      setDangGui(false);
      return;
    }

    const ghiChu = [
      `Người lớn: ${form.nguoiLon}, trẻ em: ${form.treEm}.`,
      form.ghiChu.trim(),
    ].filter(Boolean).join(" ");

    try {
      await api.post("/khach-hang/dat-ban", {
        tenKhach: form.tenKhach.trim(),
        soDienThoai: form.soDienThoai.trim(),
        soNguoi,
        thoiGianDat: thoiGianDat.toISOString(),
        ghiChu,
      });
      setThongTinDat({ ...form, ngay, gio, soNguoi });
      setForm(formBanDau);
    } catch (loi) {
      setError(loi.response?.data?.message || "Không thể gửi yêu cầu đặt bàn.");
    } finally {
      setDangGui(false);
    }
  };

  if (thongTinDat) {
    return (
      <main className="reservation-page">
        <section className="reservation-success" role="status">
          <span className="page-label">ĐÃ GHI NHẬN YÊU CẦU</span>
          <h1>Nhà hàng đã nhận yêu cầu đặt bàn</h1>
          <p>Nhân viên nhà hàng sẽ sớm liên hệ qua số điện thoại để xác nhận lại lịch hẹn của quý khách.</p>
          <div className="reservation-summary">
            <p><strong>Khách:</strong> {thongTinDat.tenKhach}</p>
            <p><strong>Số người:</strong> {thongTinDat.soNguoi} ({thongTinDat.nguoiLon} người lớn, {thongTinDat.treEm} trẻ em)</p>
            <p><strong>Thời gian:</strong> {thongTinDat.gio} · {thongTinDat.ngay}</p>
            <p><strong>Số điện thoại:</strong> {thongTinDat.soDienThoai}</p>
          </div>
          <button type="button" className="secondary-button" onClick={() => setThongTinDat(null)}>Đặt thêm bàn</button>
        </section>
      </main>
    );
  }

  return (
    <main className="reservation-page">
      <span className="page-label">ĐẶT CHỖ TRƯỚC</span>
      <h1>Hẹn bạn tại NgonNhà</h1>
      <p className="reservation-intro">Để lại thông tin, nhà hàng sẽ gọi xác nhận thời gian và số lượng khách.</p>
      <form className="reservation-form" onSubmit={submit}>
        <label>Họ và tên<input name="tenKhach" value={form.tenKhach} onChange={change} autoComplete="name" required /></label>
        <label>Số điện thoại<input name="soDienThoai" type="tel" value={form.soDienThoai} onChange={change} autoComplete="tel" required /></label>
        <label>Người lớn<input name="nguoiLon" type="number" min="1" max="50" value={form.nguoiLon} onChange={change} required /></label>
        <label>Trẻ em<input name="treEm" type="number" min="0" max="50" value={form.treEm} onChange={change} /></label>
        <label className="full-width">Ngày và giờ đến<input name="thoiGianDat" type="datetime-local" value={form.thoiGianDat} onChange={change} required /></label>
        <label className="full-width">Yêu cầu đặc biệt<textarea name="ghiChu" rows="4" maxLength={500} value={form.ghiChu} onChange={change} placeholder="Bàn gần cửa sổ, sinh nhật, ghế trẻ em..." /></label>
        {error && <p className="error-text full-width" role="alert">{error}</p>}
        <button className="primary-button full-width" disabled={dangGui}>{dangGui ? "Đang gửi yêu cầu..." : "Gửi yêu cầu đặt bàn"}</button>
      </form>
    </main>
  );
}

export default Booking;
