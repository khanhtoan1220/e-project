function OrderTracking() {
  const orders = [
    {
      id: 1,
      name: "Nấm rừng thượng hạng",
      quantity: 2,
      status: "waiting",
    },
    {
      id: 2,
      name: "Lẩu dầu cay",
      quantity: 1,
      status: "cooking",
    },
    {
      id: 3,
      name: "Tôm phỉ thúy",
      quantity: 1,
      status: "completed",
    },
  ];

  const statusMap = {
    waiting: {
      label: "Đang chờ bếp nhận đơn",
      className: "status-waiting",
    },

    cooking: {
      label: "Đang chế biến",
      className: "status-cooking",
    },

    completed: {
      label: "Món đã hoàn thành / Đang bưng ra",
      className: "status-completed",
    },
  };

  return (
    <main className="order-tracking-page">

      <span className="page-label">
        THEO DÕI ĐƠN
      </span>

      <h1>
        Đơn hàng của bạn
      </h1>

      <div className="order-list">

        {orders.map((order) => {
          const status =
            statusMap[order.status];

          return (
            <article
              className="order-item"
              key={order.id}
            >
              <div>
                <h3>
                  {order.name}
                </h3>

                <p>
                  Số lượng:{" "}
                  {order.quantity}
                </p>
              </div>

              <span
                className={`order-status ${status.className}`}
              >
                {status.label}
              </span>
            </article>
          );
        })}

      </div>

      <button
        type="button"
        className="primary-button"
        onClick={() =>
          window.location.href =
            "/order"
        }
      >
        Gọi thêm món
      </button>

    </main>
  );
}

export default OrderTracking;