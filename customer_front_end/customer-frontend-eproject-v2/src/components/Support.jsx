import { useState } from "react";
import api from "../services/api";

function Support() {
  const [form, setForm] = useState({
    banId: "",
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
      const response = await api.post("/khach-hang/ho-tro", form);
      setMessage(response.data?.message || "Đã gửi yêu cầu hỗ trợ.");
      setForm({ banId: "", loaiYeuCau: "goiNhanVien", noiDung: "" });
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || "Không thể gửi yêu cầu.");
    }
  };

  return (
    <section className="page-section narrow-section">
      <h1>Yêu cầu hỗ trợ</h1>
      <form className="form-card" onSubmit={submit}>
        <label>Mã bàn</label>
        <input
          name="banId"
          value={form.banId}
          onChange={change}
          placeholder="Nhập ID bàn"
          required
        />

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

        <button className="primary-button">Gửi yêu cầu</button>
      </form>
    </section>
  );
}

export default Support;
