import { useState } from "react";
import api from "../services/api";

function Support({ banId }) {
  const [form, setForm] = useState({
    loaiYeuCau: "goiNhanVien",
    noiDung: ""
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
      if (!banId) {
        setError("Vui lòng quét mã QR tại bàn để gọi nhân viên.");
        return;
      }
      const response = await api.post(`/khach-hang/ban/${banId}/ho-tro`, form);
      setMessage(response.data?.message || "Đã gửi yêu cầu hỗ trợ.");
      setForm({ loaiYeuCau: "goiNhanVien", noiDung: "" });
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || "Không thể gửi yêu cầu.");
    }
  };

  return (
    <section className="page-section narrow-section">
      <h1>Yêu cầu hỗ trợ</h1>
      <form className="form-card" onSubmit={submit}>
        {banId ? <p className="hint">Yêu cầu hỗ trợ cho bàn đang dùng mã QR.</p> : <p className="hint">Tính năng gọi nhân viên chỉ dùng được khi bạn đang ngồi tại bàn và đã quét mã QR.</p>}

        <label>Loại yêu cầu</label>
        <select name="loaiYeuCau" value={form.loaiYeuCau} onChange={change}>
          <option value="goiNhanVien">Gọi nhân viên</option>
          <option value="themDungCu">Thêm dụng cụ</option>
          <option value="themNuoc">Thêm nước</option>
          <option value="thanhToan">Yêu cầu thanh toán</option>
          <option value="khac">Khác</option>
        </select>

        <label>Nội dung</label>
        <textarea
          name="noiDung"
          value={form.noiDung}
          onChange={change}
          placeholder="Nội dung cần hỗ trợ"
        />

        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}

        <button className="primary-button" disabled={!banId}>Gửi yêu cầu</button>
      </form>
    </section>
  );
}

export default Support;
