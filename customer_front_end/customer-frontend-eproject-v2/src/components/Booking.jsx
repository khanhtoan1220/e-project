import { useState } from "react";
import api from "../services/api";

function Booking() {
  const [form, setForm] = useState({
    tenKhach: "",
    soDienThoai: "",
    thoiGianDat: "",
    soNguoi: 2,
    ghiChu: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const change = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await api.post("/khach-hang/dat-ban", {
        ...form,
        soNguoi: Number(form.soNguoi),
        thoiGianDat: new Date(form.thoiGianDat).toISOString()
      });
      setMessage(
        response.data?.message || "Đặt bàn thành công, vui lòng chờ nhà hàng xác nhận."
      );
      setForm({
        tenKhach: "",
        soDienThoai: "",
        thoiGianDat: "",
        soNguoi: 2,
        ghiChu: ""
      });
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || "Không thể gửi yêu cầu đặt bàn.");
    }
  };

  return (
    <section className="page-section narrow-section">
      <h1>Đặt bàn</h1>
      <form className="form-card" onSubmit={submit}>
        <label>Họ và tên</label>
        <input name="tenKhach" value={form.tenKhach} onChange={change} required />

        <label>Số điện thoại</label>
        <input name="soDienThoai" value={form.soDienThoai} onChange={change} required />

        <label>Thời gian đặt</label>
        <input
          type="datetime-local"
          name="thoiGianDat"
          value={form.thoiGianDat}
          onChange={change}
          required
        />

        <label>Số người</label>
        <input
          type="number"
          min="1"
          name="soNguoi"
          value={form.soNguoi}
          onChange={change}
          required
        />

        <label>Ghi chú</label>
        <textarea name="ghiChu" value={form.ghiChu} onChange={change} />

        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}

        <button className="primary-button">Gửi yêu cầu đặt bàn</button>
      </form>
    </section>
  );
}

export default Booking;
