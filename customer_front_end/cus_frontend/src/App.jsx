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

function App() {
  const [page, setPage] = useState("home");

  const [selectedCategoryId, setSelectedCategoryId] =
    useState(null);

  const [cart, setCart] = useState([]);

  const [message, setMessage] = useState("");

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
      />

      {message && (
        <div className="toast-message">
          {message}
        </div>
      )}

      <main>
        {page === "home" && (
          <>
            <section className="hero">
              <div className="hero-content">
                <p className="eyebrow">
                  NGON TỪ TÂM
                </p>

                <h1>
                  Món ngon mỗi ngày,
                  phục vụ tận tâm
                </h1>

                <p>
                  Khám phá thực đơn và gọi món
                  trực tiếp từ hệ thống nhà hàng.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setPage("menu")
                  }
                >
                  Xem thực đơn
                </button>
              </div>
            </section>

            <section className="home-section">
              <h2>
                Khám phá thực đơn
              </h2>

              <p>
                Chọn danh mục để xem những món
                đang còn bán.
              </p>

              <Category
                selectedCategoryId={
                  selectedCategoryId
                }
                onSelectCategory={(id) => {
                  setSelectedCategoryId(id);
                  setPage("menu");
                }}
              />
            </section>
          </>
        )}

        {page === "menu" && (
          <section className="page-section">
            <h1>
              Thực đơn
            </h1>

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
              onAddToCart={
                addToCart
              }
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
          <Support />
        )}

        {page === "reservation" && (
          <Reservation />
        )}

        {page === "order" && (
          <TableMenu />
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