import { useEffect, useMemo, useState } from "react";
import "./index.css";
import Header from "./components/Header";
import Category from "./components/Category";
import Menu from "./components/Menu";
import DatMon from "./components/DatMon";
import Checkout from "./components/Checkout";
import Booking from "./components/Booking";
import Support from "./components/Support";
import Footer from "./components/Footer";

import Reservation from "./pages/Reservation";
import TableMenu from "./pages/TableMenu";
import OrderTracking from "./pages/OrderTracking";
import api from "./services/api";

function App() {
  const banIdQr = new URLSearchParams(window.location.search).get("banId");
  const [page, setPage] = useState(() => banIdQr ? "order" : "home");

  const [selectedCategoryId, setSelectedCategoryId] =
    useState(null);

  const [cart, setCart] = useState([]);

  const [message, setMessage] = useState("");
  const [minGia, setMinGia] = useState("");
  const [maxGia, setMaxGia] = useState("");
  const [searchMenu, setSearchMenu] = useState("");
  const [monBanChay, setMonBanChay] = useState([]);
  const coBanQr = Boolean(banIdQr);

  useEffect(() => {
    let dangTai = true;
    const taiMonBanChay = async () => {
      try {
        const [thongKe, thucDon] = await Promise.all([
          api.get("/khach-hang/mon-ban-chay"),
          api.get("/thuc-don/mon-an", { params: { conBan: true } }),
        ]);
        if (!dangTai) return;
        const monAn = Array.isArray(thucDon.data) ? thucDon.data : [];
        setMonBanChay((Array.isArray(thongKe.data) ? thongKe.data : [])
          .map((item) => ({
            ...item,
            mon: monAn.find((mon) => mon.ten === item._id),
          }))
          .filter((item) => item.mon)
          .slice(0, 3));
      } catch {
        if (dangTai) setMonBanChay([]);
      }
    };
    taiMonBanChay();
    return () => { dangTai = false; };
  }, []);

  const cartCount = useMemo(
    () =>
      cart.reduce(
        (sum, item) =>
          sum + Number(item.quantity || 0),
        0
      ),
    [cart]
  );

  const addToCart = (item) => {
    setCart((current) => {
      const found = current.find(
        (x) => x._id === item._id
      );

      if (found) {
        return current.map((x) =>
          x._id === item._id
            ? {
                ...x,
                quantity:
                  Number(x.quantity || 0) + 1,
              }
            : x
        );
      }

      return [
        ...current,
        {
          ...item,
          quantity: 1,
          note: "",
        },
      ];
    });

    setMessage(
      `Đã thêm "${item.name}" vào giỏ hàng.`
    );
  };

  const increaseQuantity = (id) => {
    setCart((current) =>
      current.map((item) =>
        item._id === id
          ? {
              ...item,
              quantity:
                Number(item.quantity || 0) + 1,
            }
          : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCart((current) =>
      current
        .map((item) =>
          item._id === id
            ? {
                ...item,
                quantity:
                  Number(item.quantity || 0) - 1,
              }
            : item
        )
        .filter(
          (item) =>
            Number(item.quantity || 0) > 0
        )
    );
  };

  const removeFromCart = (id) => {
    setCart((current) =>
      current.filter(
        (item) => item._id !== id
      )
    );
  };

  const updateNote = (id, note) => {
    setCart((current) =>
      current.map((item) =>
        item._id === id
          ? {
              ...item,
              note,
            }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(
      () => setMessage(""),
      2500
    );

    return () => clearTimeout(timer);
  }, [message]);

  return (
    <div className="app">
      <Header
        cartCount={cartCount}
        currentPage={page}
        onNavigate={setPage}
        hasTable={coBanQr}
      />

      {message && (
        <div className="toast-message">
          {message}
        </div>
      )}

      <main>
        {page === "home" && (
          <>
            <section className="hero home-hero">
              <div className="hero-content">
                <p className="eyebrow">
                  NHÀ HÀNG NGON NHÀ · PHỤC VỤ TẬN TÂM
                </p>

                <h1>
                  Bữa ngon trọn vị,
                  phút giây đáng nhớ
                </h1>

                <p>
                  Thưởng thức món Việt được chuẩn bị mỗi ngày trong không gian ấm cúng dành cho gia đình và bạn bè.
                </p>

                <button
                  type="button"
                  onClick={() => setPage("booking")}
                >
                  Đặt bàn ngay
                </button>
                <button className="hero-secondary-button" type="button" onClick={() => setPage("menu")}>
                  Xem thực đơn
                </button>
              </div>
            </section>

            <section className="home-section">
              <div className="home-intro-grid">
                <article><span>ĐỊA CHỈ</span><strong>Hà Nội, Việt Nam</strong></article>
                <article><span>HOTLINE</span><strong>0123 456 789</strong></article>
                <article><span>GIỜ MỞ CỬA</span><strong>09:00 – 22:00</strong></article>
              </div>
              <div className="section-heading">
                <div><span className="page-label">ĐƯỢC YÊU THÍCH</span><h2>Món bán chạy</h2></div>
                <button type="button" className="text-button" onClick={() => setPage("menu")}>Xem toàn bộ thực đơn</button>
              </div>
              {monBanChay.length ? (
                <div className="featured-grid">
                  {monBanChay.map((item) => (
                    <article className="featured-card" key={item._id}>
                      {item.mon.hinhAnh && <img src={item.mon.hinhAnh} alt={item.mon.ten} />}
                      <div><span>ĐÃ BÁN {item.soLuongDaBan} PHẦN</span><h3>{item.mon.ten}</h3><strong>{Number(item.mon.gia).toLocaleString("vi-VN")} đ</strong></div>
                    </article>
                  ))}
                </div>
              ) : <p className="muted-copy">Món nổi bật sẽ hiển thị tại đây.</p>}
            </section>
          </>
        )}

        {page === "menu" && (
          <section className="page-section">
            <h1>
              Thực đơn
            </h1>

            <p className="public-menu-intro">Tham khảo món ăn và giá trước khi ghé nhà hàng. Quý khách có thể đặt bàn trực tuyến.</p>

            <div className="public-menu-filters">
              <label className="public-menu-search">Tìm món<input type="search" value={searchMenu} onChange={(event) => setSearchMenu(event.target.value)} placeholder="Nhập tên món ăn" /></label>
              <label>Giá từ<input type="number" min="0" value={minGia} onChange={(event) => setMinGia(event.target.value)} placeholder="0 đ" /></label>
              <label>Đến<input type="number" min="0" value={maxGia} onChange={(event) => setMaxGia(event.target.value)} placeholder="Không giới hạn" /></label>
            </div>

            <Category
              selectedCategoryId={
                selectedCategoryId
              }
              onSelectCategory={
                setSelectedCategoryId
              }
            />

            <Menu
              selectedCategoryId={
                selectedCategoryId
              }
              searchKeyword={searchMenu}
              minGia={minGia}
              maxGia={maxGia}
            />
          </section>
        )}

        {page === "cart" && (
          <DatMon
            cart={cart}
            onIncrease={
              increaseQuantity
            }
            onDecrease={
              decreaseQuantity
            }
            onRemove={
              removeFromCart
            }
            onCheckout={() =>
              setPage("checkout")
            }
          />
        )}

        {page === "checkout" && (
          <Checkout
            cart={cart}
            banId={banIdQr}
            onBack={() =>
              setPage("cart")
            }
            onSuccess={(text) => {
              clearCart();
              setMessage(text);
              setPage("menu");
            }}
          />
        )}

        {page === "booking" && (
          <Booking />
        )}

        {page === "support" && (
          <Support banId={banIdQr} />
        )}

        {page === "reservation" && (
          <Reservation />
        )}

        {page === "order" && (
          <TableMenu banId={banIdQr} />
        )}

        {page === "order-tracking" && (
          <OrderTracking />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
