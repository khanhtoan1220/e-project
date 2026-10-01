function DatMon({ cart, onIncrease, onDecrease, onRemove, onCheckout }) {
  const total = cart.reduce(
    (sum, item) => sum + Number(item.gia) * item.quantity,
    0
  );

  if (cart.length === 0) {
    return (
      <section className="page-section">
        <div className="empty-box">
          <h2>Giỏ hàng đang trống</h2>
          <p>Hãy chọn món từ thực đơn trước khi đặt món.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section">
      <h1>Giỏ hàng</h1>

      <div className="cart-list">
        {cart.map((item) => (
          <div className="cart-row" key={item._id}>
            <div>
              <h3>{item.ten}</h3>
              <p>{Number(item.gia).toLocaleString("vi-VN")} đ / món</p>
            </div>

            <div className="quantity">
              <button onClick={() => onDecrease(item._id)}>-</button>
              <strong>{item.quantity}</strong>
              <button onClick={() => onIncrease(item._id)}>+</button>
            </div>

            <strong>
              {(Number(item.gia) * item.quantity).toLocaleString("vi-VN")} đ
            </strong>

            <button className="danger-button" onClick={() => onRemove(item._id)}>
              Xóa
            </button>
          </div>
        ))}
      </div>

      <div className="cart-total">
        <span>Tổng tiền</span>
        <strong>{total.toLocaleString("vi-VN")} đ</strong>
      </div>

      <button className="primary-button" onClick={onCheckout}>
        Tiến hành đặt món
      </button>
    </section>
  );
}

export default DatMon;
