import { useMemo, useState } from "react";

import Category from "../components/Category";
import Menu from "../components/Menu";
import DatMon from "../components/DatMon";

function TableMenu() {
  const [selectedCategoryId, setSelectedCategoryId] =
    useState(null);

  const [searchKeyword, setSearchKeyword] =
    useState("");

  const [cart, setCart] = useState([]);

  const [showCart, setShowCart] =
    useState(false);

  const addToCart = (item) => {
    setCart((currentCart) => {
      const existingItem =
        currentCart.find(
          (cartItem) =>
            cartItem._id === item._id
        );

      if (existingItem) {
        return currentCart.map(
          (cartItem) =>
            cartItem._id === item._id
              ? {
                  ...cartItem,
                  quantity:
                    cartItem.quantity + 1,
                }
              : cartItem
        );
      }

      return [
        ...currentCart,
        {
          ...item,
          quantity: 1,
          note: "",
        },
      ];
    });
  };

  const updateQuantity = (
    id,
    quantity
  ) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item._id === id
            ? {
                ...item,
                quantity,
              }
            : item
        )
        .filter(
          (item) => item.quantity > 0
        )
    );
  };

  const updateNote = (
    id,
    note
  ) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item._id === id
          ? {
              ...item,
              note,
            }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) =>
          item._id !== id
      )
    );
  };

  const cartQuantity = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total +
          Number(
            item.quantity || 0
          ),
        0
      ),
    [cart]
  );

  const cartTotal = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total +
          Number(
            item.price || 0
          ) *
            Number(
              item.quantity || 0
            ),
        0
      ),
    [cart]
  );

  return (
    <main className="table-order-page">

      <section className="table-header">
        <div>
          <span className="page-label">
            GỌI MÓN TẠI BÀN
          </span>

          <h1>
            Bàn chưa xác định
          </h1>

          <p>
            Vui lòng chọn món bạn muốn gọi
          </p>
        </div>

        <div className="table-status">
          Đang phục vụ
        </div>
      </section>

      <section className="menu-toolbar">
        <input
          type="text"
          className="menu-search"
          placeholder="Tìm món ăn..."
          value={searchKeyword}
          onChange={(event) =>
            setSearchKeyword(
              event.target.value
            )
          }
        />
      </section>

      <section className="category-section">
        <Category
          selectedCategoryId={
            selectedCategoryId
          }
          onSelectCategory={
            setSelectedCategoryId
          }
        />
      </section>

      <section className="menu-section">
        <Menu
          selectedCategoryId={
            selectedCategoryId
          }
          searchKeyword={
            searchKeyword
          }
          onAddToCart={
            addToCart
          }
        />
      </section>

      {cartQuantity > 0 && (
        <button
          type="button"
          className="floating-cart"
          onClick={() =>
            setShowCart(true)
          }
        >
          <span>
            Giỏ hàng ({cartQuantity})
          </span>

          <strong>
            {cartTotal.toLocaleString(
              "vi-VN"
            )}{" "}
            đ
          </strong>
        </button>
      )}

      {showCart && (
        <Cart
          cart={cart}
          onClose={() =>
            setShowCart(false)
          }
          onUpdateQuantity={
            updateQuantity
          }
          onUpdateNote={
            updateNote
          }
          onRemove={
            removeItem
          }
        />
      )}

    </main>
  );
}

export default TableMenu;