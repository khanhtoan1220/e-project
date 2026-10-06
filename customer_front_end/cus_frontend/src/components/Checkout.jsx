import { useState } from "react";
import api from "../services/api";

function Checkout({ cart, banId, onBack, onSuccess }) {
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = cart.reduce(
    (sum, item) => sum + Number(item.gia) * item.quantity,
    0
  );

  const updateNote = (id, value) => {
    setNotes((current) => ({ ...current, [id]: value }));
  };

  const submitOrder = async (event) => {
    event.preventDefault();
    setError("");

    if (!banId) {
      setError("Hãy quét mã QR cố định trên bàn trước khi gọi món.");
      return;
    }

    if (!cart.length) {
      setError("Giỏ hàng đang trống.");
      return;
    }

    const chonMon = cart.map((item) => ({
      menuId: item._id,
      soLuong: item.quantity,
      ghiChu: notes[item._id] || ""
    }));

    try {
      setLoading(true);

      const response = await api.post(`/khach-hang/ban/${banId}/goi-mon`, {
        chonMon
      });

      onSuccess(
        response.data?.message || "Gọi món thành công. Món ăn đã được gửi tới bếp."
      );
    } catch (error) {
      console.error(error);
      setError(
        error.response?.data?.message ||
          "Không thể gửi món. Hãy quét lại mã QR trên bàn."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-section">
      <h1>Xác nhận gọi món</h1>

      <div className="checkout-grid">
        <form className="form-card" onSubmit={submitOrder}>
          <p className="hint">
            Bàn được nhận diện từ mã QR cố định; món sẽ được cộng vào hóa đơn đang mở của bàn.
          </p>

          <h3>Ghi chú từng món</h3>
          {cart.map((item) => (
            <div className="note-group" key={item._id}>
              <label>{item.ten}</label>
              <input
                value={notes[item._id] || ""}
                onChange={(event) => updateNote(item._id, event.target.value)}
                placeholder="Ví dụ: ít cay, không hành..."
              />
            </div>
          ))}

          {error && <p className="error-text">{error}</p>}

          <div className="checkout-actions">
            <button type="button" className="secondary-button" onClick={onBack}>
              Quay lại giỏ
            </button>
            <button className="primary-button" disabled={loading}>
              {loading ? "Đang gửi..." : "Xác nhận gọi món"}
            </button>
          </div>
        </form>

        <div className="summary-card">
          <h2>Đơn hiện tại</h2>
          {cart.map((item) => (
            <div className="summary-row" key={item._id}>
              <span>{item.ten} × {item.quantity}</span>
              <strong>
                {(Number(item.gia) * item.quantity).toLocaleString("vi-VN")} đ
              </strong>
            </div>
          ))}
          <div className="summary-total">
            <span>Tổng</span>
            <strong>{total.toLocaleString("vi-VN")} đ</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Checkout;
