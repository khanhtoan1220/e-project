const trangThaiMon = {
  choXacNhan: { ten: "Chờ nhân viên xác nhận", mau: "waiting" },
  choCheBien: { ten: "Đang chờ bếp nhận đơn", mau: "waiting" },
  dangLam: { ten: "Đang chế biến", mau: "cooking" },
  daXong: { ten: "Món đã hoàn thành · chờ mang ra", mau: "completed" },
  daPhucVu: { ten: "Đã phục vụ", mau: "completed" },
  daHuy: { ten: "Món đã hủy", mau: "cancelled" },
};

function OrderTracking({ ban, hoaDon, loading, onRefresh, onOrderMore }) {
  const danhSachMon = hoaDon?.danhSachMon || [];

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
            </article>
          );
        })}
      </section>

      <section className="bill-total-card">
        <div>
          <span>Hóa đơn tạm tính</span>
          <small>{danhSachMon.length} dòng món · đã gồm các lần gọi trước</small>
        </div>
        <strong>{Number(hoaDon?.tongTien || 0).toLocaleString("vi-VN")} đ</strong>
      </section>

      <button type="button" className="primary-button" onClick={onOrderMore}>Gọi thêm món</button>
    </main>
  );
}

export default OrderTracking;
