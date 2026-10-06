import { useCallback, useEffect, useMemo, useState } from "react";
import Category from "../components/Category";
import Menu from "../components/Menu";
import OrderTracking from "./OrderTracking";
import api from "../services/api";

const loaiYeuCau = [
  { ma: "goiNhanVien", ten: "Gọi nhân viên" },
  { ma: "themDungCu", ten: "Thêm chén đũa / khăn lạnh" },
  { ma: "themNuoc", ten: "Châm nước lẩu / thêm đá" },
  { ma: "thanhToan", ten: "Yêu cầu thanh toán" },
  { ma: "khac", ten: "Khác" },
];

function TableMenu({ banId }) {
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [tab, setTab] = useState("menu");
  const [ban, setBan] = useState(null);
  const [hoaDon, setHoaDon] = useState(null);
  const [loadingBan, setLoadingBan] = useState(true);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [supportType, setSupportType] = useState("goiNhanVien");
  const [supportText, setSupportText] = useState("");
  const [supportError, setSupportError] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [sendingSupport, setSendingSupport] = useState(false);

  const capNhatHoaDon = useCallback((data) => {
    const banHienTai = data?.banId && typeof data.banId === "object"
      ? data.banId
      : data?.banId
        ? { _id: data.banId, ten: data.tenBan, khuVuc: data.khuVuc, trangThai: data.trangThai }
        : null;
    setBan(banHienTai);
    setHoaDon({
      danhSachMon: data?.danhSachMonDaGoi || data?.danhSachMon || [],
      tongTien: data?.tongTienTamTinh ?? data?.tongTien ?? 0,
    });
  }, []);

  const taiHoaDon = useCallback(async () => {
    if (!banId) return;
    const response = await api.get(`/khach-hang/ban/${banId}`);
    capNhatHoaDon(response.data);
  }, [banId, capNhatHoaDon]);

  useEffect(() => {
    let dangTai = true;

    const moBan = async () => {
      if (!banId) {
        setError("Không tìm thấy mã bàn trong đường dẫn QR.");
        setLoadingBan(false);
        return;
      }

      try {
        const response = await api.post(`/khach-hang/ban/${banId}/mo`);
        if (dangTai) {
          capNhatHoaDon(response.data?.hoaDon);
          setError("");
        }
      } catch (loi) {
        if (dangTai) {
          setError(loi.response?.data?.message || "Không thể mở bàn.");
        }
      } finally {
        if (dangTai) setLoadingBan(false);
      }
    };

    moBan();
    return () => { dangTai = false; };
  }, [banId, capNhatHoaDon]);

  useEffect(() => {
    if (!banId || loadingBan || !ban) return undefined;
    const timer = window.setInterval(() => {
      taiHoaDon().catch(() => {});
    }, 3000);
    return () => window.clearInterval(timer);
  }, [banId, ban, loadingBan, taiHoaDon]);

  const addToCart = (item) => {
    setCart((current) => {
      const found = current.find((x) => x._id === item._id);
      if (found) {
        return current.map((x) => x._id === item._id
          ? { ...x, quantity: Math.min(100, x.quantity + 1) }
          : x);
      }
      return [...current, { ...item, quantity: 1, note: "" }];
    });
  };

  const updateQuantity = (id, quantity) => {
    setCart((current) => current
      .map((item) => item._id === id ? { ...item, quantity } : item)
      .filter((item) => item.quantity > 0));
  };

  const updateNote = (id, note) => {
    setCart((current) => current.map((item) => item._id === id ? { ...item, note } : item));
  };

  const removeItem = (id) => setCart((current) => current.filter((item) => item._id !== id));

  const cartQuantity = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [cart],
  );

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.price || 0) * item.quantity, 0),
    [cart],
  );

  const guiMon = async () => {
    if (!banId || !cart.length) return;
    setLoadingOrder(true);
    setError("");
    try {
      await api.post(`/khach-hang/ban/${banId}/goi-mon`, {
        chonMon: cart.map((item) => ({
          menuId: item._id,
          soLuong: item.quantity,
          ghiChu: item.note || "",
        })),
      });
      setCart([]);
      setShowCart(false);
      setMessage("Đã gửi món xuống bếp. Bạn có thể theo dõi trạng thái tại mục Món đã gọi.");
      setTab("tracking");
      await taiHoaDon().catch(() => {});
    } catch (loi) {
      setError(loi.response?.data?.message || "Không thể gửi món.");
    } finally {
      setLoadingOrder(false);
    }
  };

  const guiYeuCau = async (event) => {
    event.preventDefault();
    setSupportError("");
    setSupportMessage("");
    setSendingSupport(true);
    try {
      const response = await api.post(`/khach-hang/ban/${banId}/ho-tro`, {
        loaiYeuCau: supportType,
        noiDung: supportText.trim(),
      });
      setSupportMessage(response.data?.message || "Đã gửi yêu cầu tới nhân viên.");
      setSupportText("");
    } catch (loi) {
      setSupportError(loi.response?.data?.message || "Không thể gửi yêu cầu.");
    } finally {
      setSendingSupport(false);
    }
  };

  return (
    <main className="table-order-page">
      <section className="table-header">
        <div>
          <span className="page-label">GỌI MÓN TẠI BÀN</span>
          <h1>{ban?.ten || (loadingBan ? "Đang kết nối bàn..." : "Gọi món tại bàn")}</h1>
          <p>{ban ? `${ban.khuVuc?.replace("tang", "Tầng ")} · Hóa đơn tạm tính cập nhật tự động` : "Quét mã QR đặt tại bàn để bắt đầu gọi món."}</p>
        </div>
        <div className="table-status">{loadingBan ? "Đang kết nối" : ban ? "Đang phục vụ" : "Chưa mở bàn"}</div>
      </section>

      {error && <p className="error-text" role="alert">{error}</p>}
      {message && <p className="success-text" role="status">{message}</p>}

      <div className="order-tabs" role="tablist" aria-label="Nội dung bàn">
        <button type="button" className={tab === "menu" ? "active" : ""} onClick={() => setTab("menu")}>Thực đơn</button>
        <button type="button" className={tab === "tracking" ? "active" : ""} onClick={() => setTab("tracking")}>
          Món đã gọi {hoaDon?.danhSachMon?.length ? `(${hoaDon.danhSachMon.length})` : ""}
        </button>
      </div>

      {tab === "menu" ? (
        <>
          <section className="menu-toolbar">
            <input
              type="search"
              className="menu-search"
              placeholder="Tìm món ăn..."
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
            />
          </section>
          <section className="category-section">
            <Category selectedCategoryId={selectedCategoryId} onSelectCategory={setSelectedCategoryId} />
          </section>
          <section className="menu-section">
            <Menu selectedCategoryId={selectedCategoryId} searchKeyword={searchKeyword} onAddToCart={addToCart} />
          </section>
        </>
      ) : (
        <OrderTracking
          ban={ban}
          hoaDon={hoaDon}
          loading={loadingBan}
          onRefresh={() => taiHoaDon().catch(() => {})}
          onOrderMore={() => setTab("menu")}
        />
      )}

      {tab === "menu" && cartQuantity > 0 && (
        <button type="button" className="floating-cart" onClick={() => setShowCart(true)} disabled={!ban || loadingBan}>
          <span>Giỏ hàng ({cartQuantity})</span>
          <strong>{cartTotal.toLocaleString("vi-VN")} đ</strong>
        </button>
      )}

      {ban && (
        <button type="button" className="service-bell" aria-label="Gọi nhân viên" onClick={() => setShowSupport(true)}>
          Gọi nhân viên
        </button>
      )}

      {showCart && (
        <div className="cart-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowCart(false); }}>
          <section className="cart-panel" role="dialog" aria-modal="true" aria-label="Xác nhận món">
            <div className="cart-header">
              <div><span className="page-label">BÀN {ban?.ten}</span><h2>Kiểm tra món gọi</h2></div>
              <button type="button" className="cart-close" onClick={() => setShowCart(false)} aria-label="Đóng">×</button>
            </div>
            <div className="cart-items">
              {cart.map((item) => (
                <article className="cart-item" key={item._id}>
                  <div className="cart-item-info"><h3>{item.name}</h3><p>{Number(item.price).toLocaleString("vi-VN")} đ</p></div>
                  <div className="quantity-control">
                    <button type="button" aria-label={`Giảm ${item.name}`} onClick={() => updateQuantity(item._id, item.quantity - 1)}>−</button>
                    <span>{item.quantity}</span>
                    <button type="button" aria-label={`Tăng ${item.name}`} onClick={() => updateQuantity(item._id, Math.min(100, item.quantity + 1))}>+</button>
                  </div>
                  <label className="cart-note-label">Ghi chú món
                    <input className="cart-note" value={item.note} maxLength={500} placeholder="Không hành, giảm cay, ít đá..." onChange={(event) => updateNote(item._id, event.target.value)} />
                  </label>
                  <button type="button" className="remove-item" onClick={() => removeItem(item._id)}>Xóa món</button>
                </article>
              ))}
            </div>
            <div className="cart-summary"><span>Tổng dự kiến</span><strong>{cartTotal.toLocaleString("vi-VN")} đ</strong></div>
            <button type="button" className="primary-button" disabled={loadingOrder || loadingBan || !ban} onClick={guiMon}>
              {loadingOrder ? "Đang gửi..." : "Xác nhận gửi đơn đến bếp"}
            </button>
          </section>
        </div>
      )}

      {showSupport && (
        <div className="cart-overlay service-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowSupport(false); }}>
          <section className="support-dialog" role="dialog" aria-modal="true" aria-labelledby="support-title">
            <div className="cart-header">
              <div><span className="page-label">BÀN {ban?.ten}</span><h2 id="support-title">Gọi nhân viên</h2></div>
              <button type="button" className="cart-close" onClick={() => setShowSupport(false)} aria-label="Đóng">×</button>
            </div>
            <form className="service-form" onSubmit={guiYeuCau}>
              <label htmlFor="service-type">Bạn cần hỗ trợ việc gì?</label>
              <select id="service-type" value={supportType} onChange={(event) => setSupportType(event.target.value)}>
                {loaiYeuCau.map((item) => <option key={item.ma} value={item.ma}>{item.ten}</option>)}
              </select>
              <label htmlFor="service-note">Lời nhắn thêm</label>
              <textarea id="service-note" rows="3" maxLength={300} value={supportText} onChange={(event) => setSupportText(event.target.value)} placeholder="Ví dụ: châm thêm nước lẩu vị cay..." />
              {supportMessage && <p className="success-text" role="status">{supportMessage}</p>}
              {supportError && <p className="error-text" role="alert">{supportError}</p>}
              <button className="primary-button" disabled={sendingSupport}>{sendingSupport ? "Đang gửi..." : "Gửi yêu cầu"}</button>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default TableMenu;
