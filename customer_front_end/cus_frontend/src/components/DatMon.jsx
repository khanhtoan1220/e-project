function Cart({
  cart,
  onClose,
  onUpdateQuantity,
  onUpdateNote,
  onRemove,
}) {
  const total = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) *
        Number(item.quantity || 0),
    0
  );

  return (
    <div className="cart-overlay">
      <div className="cart-panel">

        <div className="cart-header">
          <div>
            <span className="page-label">
              ĐƠN GỌI MÓN
            </span>

            <h2>
              Giỏ hàng
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cart-close"
          >
            ×
          </button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <p>
              Chưa có món nào.
            </p>
          ) : (
            cart.map((item) => (
              <div
                className="cart-item"
                key={item._id}
              >
                <div className="cart-item-info">
                  <h3>
                    {item.name}
                  </h3>

                  <p>
                    {Number(
                      item.price || 0
                    ).toLocaleString(
                      "vi-VN"
                    )}{" "}
                    đ
                  </p>
                </div>

                <div className="quantity-control">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateQuantity(
                        item._id,
                        item.quantity - 1
                      )
                    }
                  >
                    −
                  </button>

                  <span>
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      onUpdateQuantity(
                        item._id,
                        item.quantity + 1
                      )
                    }
                  >
                    +
                  </button>
                </div>

                <input
                  className="cart-note"
                  type="text"
                  placeholder="Ghi chú: ít cay, không hành..."
                  value={
                    item.note || ""
                  }
                  onChange={(event) =>
                    onUpdateNote(
                      item._id,
                      event.target.value
                    )
                  }
                />

                <button
                  type="button"
                  className="remove-item"
                  onClick={() =>
                    onRemove(
                      item._id
                    )
                  }
                >
                  Xóa
                </button>
              </div>
            ))
          )}
        </div>

        <div className="cart-summary">
          <span>
            Tạm tính
          </span>

          <strong>
            {total.toLocaleString(
              "vi-VN"
            )}{" "}
            đ
          </strong>
        </div>

        <button
          type="button"
          className="primary-button"
          disabled={cart.length === 0}
        >
          Xác nhận gửi đơn đến Bếp
        </button>

      </div>
    </div>
  );
}

export default Cart;